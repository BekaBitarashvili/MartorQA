from flask import Flask, render_template, request, jsonify, send_file, session
import asyncio
import aiohttp
import threading
import time
from datetime import datetime
import json
from collections import defaultdict
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.barcharts import VerticalBarChart
import io
import os

app = Flask(__name__)
app.secret_key = 'martorqa_secret_key_2025'

# Global variables for stress testing
test_results = defaultdict(list)
test_status = {'running': False, 'paused': False}
test_config = {}
test_stats = {
    'total_requests': 0,
    'successful_requests': 0,
    'failed_requests': 0,
    'response_times': [],
    'timestamps': [],
    'errors': []
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/register')
def register():
    return render_template('register.html')


@app.route('/stress-test')
def stress_test():
    return render_template('stress_test.html')


@app.route('/api/start-test', methods=['POST'])
def start_test():
    global test_status, test_config, test_stats

    data = request.json
    test_config = {
        'url': data.get('url'),
        'users': int(data.get('users', 10)),
        'duration': int(data.get('duration', 30)),
        'ramp_up': int(data.get('ramp_up', 5))
    }

    # Reset stats
    test_stats = {
        'total_requests': 0,
        'successful_requests': 0,
        'failed_requests': 0,
        'response_times': [],
        'timestamps': [],
        'errors': []
    }

    test_status['running'] = True
    test_status['paused'] = False

    # Start test in background thread
    thread = threading.Thread(target=run_stress_test, args=(test_config,))
    thread.daemon = True
    thread.start()

    return jsonify({'status': 'started', 'message': 'Stress test started successfully'})


@app.route('/api/pause-test', methods=['POST'])
def pause_test():
    global test_status
    test_status['paused'] = not test_status['paused']
    status = 'paused' if test_status['paused'] else 'resumed'
    return jsonify({'status': status})


@app.route('/api/stop-test', methods=['POST'])
def stop_test():
    global test_status
    test_status['running'] = False
    test_status['paused'] = False
    return jsonify({'status': 'stopped', 'message': 'Test stopped successfully'})


@app.route('/api/update-config', methods=['POST'])
def update_config():
    global test_config
    data = request.json

    if 'users' in data:
        test_config['users'] = int(data['users'])
    if 'duration' in data:
        test_config['duration'] = int(data['duration'])

    return jsonify({'status': 'updated', 'config': test_config})


@app.route('/api/test-stats')
def get_test_stats():
    return jsonify({
        'stats': test_stats,
        'status': test_status,
        'config': test_config
    })


@app.route('/api/generate-report', methods=['POST'])
def generate_report():
    buffer = io.BytesIO()

    # Create PDF
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#ff6b35'),
        spaceAfter=30,
        alignment=TA_CENTER
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#ff6b35'),
        spaceAfter=12
    )

    # Title
    story.append(Paragraph("MartorQA Stress Test Report", title_style))
    story.append(Spacer(1, 20))

    # Test Configuration
    story.append(Paragraph("Test Configuration", heading_style))
    config_data = [
        ['Parameter', 'Value'],
        ['Target URL', test_config.get('url', 'N/A')],
        ['Number of Users', str(test_config.get('users', 0))],
        ['Test Duration', f"{test_config.get('duration', 0)} seconds"],
        ['Date', datetime.now().strftime('%Y-%m-%d %H:%M:%S')]
    ]

    config_table = Table(config_data, colWidths=[3 * inch, 3 * inch])
    config_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ff6b35')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(config_table)
    story.append(Spacer(1, 30))

    # Test Results
    story.append(Paragraph("Test Results", heading_style))

    total_requests = test_stats['total_requests']
    success_rate = (test_stats['successful_requests'] / total_requests * 100) if total_requests > 0 else 0
    avg_response_time = sum(test_stats['response_times']) / len(test_stats['response_times']) if test_stats[
        'response_times'] else 0

    results_data = [
        ['Metric', 'Value'],
        ['Total Requests', str(test_stats['total_requests'])],
        ['Successful Requests', str(test_stats['successful_requests'])],
        ['Failed Requests', str(test_stats['failed_requests'])],
        ['Success Rate', f"{success_rate:.2f}%"],
        ['Average Response Time', f"{avg_response_time:.2f} ms"],
        ['Min Response Time', f"{min(test_stats['response_times'], default=0):.2f} ms"],
        ['Max Response Time', f"{max(test_stats['response_times'], default=0):.2f} ms"]
    ]

    results_table = Table(results_data, colWidths=[3 * inch, 3 * inch])
    results_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ff6b35')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(results_table)
    story.append(Spacer(1, 30))

    # Summary
    story.append(Paragraph("Summary", heading_style))
    summary_text = f"""
    The stress test was conducted on {test_config.get('url', 'N/A')} with {test_config.get('users', 0)} concurrent users 
    for a duration of {test_config.get('duration', 0)} seconds. The test generated {total_requests} total requests, 
    with a success rate of {success_rate:.2f}%. The average response time was {avg_response_time:.2f} milliseconds.
    """
    story.append(Paragraph(summary_text, styles['Normal']))

    # Build PDF
    doc.build(story)
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'stress_test_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf',
        mimetype='application/pdf'
    )


def run_stress_test(config):
    """Run the stress test with the given configuration"""
    global test_stats, test_status

    async def make_request(session, url, user_id):
        start_time = time.time()
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                response_time = (time.time() - start_time) * 1000  # Convert to ms

                test_stats['total_requests'] += 1
                test_stats['response_times'].append(response_time)
                test_stats['timestamps'].append(time.time())

                if response.status == 200:
                    test_stats['successful_requests'] += 1
                else:
                    test_stats['failed_requests'] += 1
                    test_stats['errors'].append(f"User {user_id}: HTTP {response.status}")

                return response_time
        except Exception as e:
            test_stats['total_requests'] += 1
            test_stats['failed_requests'] += 1
            test_stats['errors'].append(f"User {user_id}: {str(e)}")
            return None

    async def user_simulation(session, url, user_id, duration):
        end_time = time.time() + duration
        while time.time() < end_time and test_status['running']:
            if not test_status['paused']:
                await make_request(session, url, user_id)
                await asyncio.sleep(1)  # Wait between requests
            else:
                await asyncio.sleep(0.5)

    async def run_test():
        url = config['url']
        num_users = config['users']
        duration = config['duration']

        async with aiohttp.ClientSession() as session:
            tasks = []
            for i in range(num_users):
                task = asyncio.create_task(user_simulation(session, url, i, duration))
                tasks.append(task)
                await asyncio.sleep(config.get('ramp_up', 5) / num_users)  # Ramp-up time

            await asyncio.gather(*tasks)

        test_status['running'] = False

    # Run the async test
    asyncio.run(run_test())


if __name__ == '__main__':
    app.run(debug=True, threaded=True)