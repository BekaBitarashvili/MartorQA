'use client';

import {useState} from 'react';
import axios from 'axios';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {Terminal, Zap, Copy, Check, ChevronRight, Code2, Loader2, Play} from 'lucide-react';

export default function Home() {
    const [text, setText] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [running, setRunning] = useState(false);
    const [runResult, setRunResult] = useState<{ success: boolean, stdout: string, stderr: string } | null>(null);
    const [steps, setSteps] = useState<object[]>([]);

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError('');
        setCode('');
        setRunResult(null);
        setSteps([]);

        try {
            const response = await axios.post('http://localhost:8000/api/generate', {
                text,
                language: 'en',
            });
            setCode(response.data.code);
            setSteps(response.data.steps);
        } catch (err) {
            setError('Failed to generate code. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleRun = async () => {
        if (!steps.length) return;
        setRunning(true);
        setRunResult(null);
        try {
            const response = await axios.post('http://localhost:8000/api/run', {steps});
            setRunResult(response.data);
        } catch (err) {
            setRunResult({success: false, stdout: '', stderr: 'Failed to run.'});
        } finally {
            setRunning(false);
        }
    };

    const handleGenerateAndRun = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError('');
        setCode('');
        setRunResult(null);
        setSteps([]);

        try {
            const genResponse = await axios.post('http://localhost:8000/api/generate', {
                text,
                language: 'en',
            });
            setCode(genResponse.data.code);
            setSteps(genResponse.data.steps);

            setLoading(false);
            setRunning(true);

            const runResponse = await axios.post('http://localhost:8000/api/run', {
                steps: genResponse.data.steps,
            });
            setRunResult(runResponse.data);
        } catch (err) {
            setError('Something went wrong. Make sure the backend is running.');
        } finally {
            setLoading(false);
            setRunning(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setCharCount(e.target.value.length);
    };

    const examples = [
        'Open login page, enter email and password, click login',
        'Navigate to homepage, search for "laptop", click first result',
        'Fill registration form with name, email, password and submit',
    ];

    return (
        <main style={{position: 'relative', zIndex: 1, minHeight: '100vh'}}>

            {/* Header */}
            <header style={{
                borderBottom: '1px solid var(--border)',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(10px)',
                background: 'rgba(8, 11, 16, 0.8)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-green))',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Terminal size={16} color="#080b10" strokeWidth={2.5}/>
                    </div>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: '700',
                        letterSpacing: '-0.5px',
                    }}>
            Martor<span style={{color: 'var(--accent)'}}>QA</span>
          </span>
                    <span style={{
                        fontSize: '10px',
                        color: 'var(--accent)',
                        border: '1px solid var(--accent)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        letterSpacing: '1px',
                    }}>BETA</span>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent-green)',
                        boxShadow: '0 0 8px var(--accent-green)',
                    }}/>
                    <span style={{fontSize: '12px', color: 'var(--text-secondary)'}}>
            codellama:7b connected
          </span>
                </div>
            </header>

            {/* Hero */}
            <section style={{
                padding: '80px 32px 60px',
                maxWidth: '900px',
                margin: '0 auto',
                animation: 'fadeInUp 0.6s ease forwards',
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'var(--accent-glow)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '100px',
                    padding: '6px 16px',
                    marginBottom: '24px',
                }}>
                    <Zap size={12} color="var(--accent)"/>
                    <span style={{fontSize: '12px', color: 'var(--accent)', letterSpacing: '1px'}}>
            NL → TEST AUTOMATION
          </span>
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(36px, 5vw, 64px)',
                    fontWeight: '800',
                    lineHeight: '1.1',
                    letterSpacing: '-2px',
                    marginBottom: '20px',
                }}>
                    Describe tests in
                    <br/>
                    <span style={{
                        background: 'linear-gradient(90deg, var(--accent), var(--accent-green))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>plain language.</span>
                </h1>

                <p style={{
                    fontSize: '16px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                    maxWidth: '500px',
                }}>
                    Write what you want to test. MartorQA generates production-ready
                    Playwright code instantly — no syntax memorization required.
                </p>
            </section>

            {/* Main Editor */}
            <section style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 32px 80px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                animation: 'fadeInUp 0.6s ease 0.2s both forwards',
            }}>

                {/* Input Panel */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <div style={{display: 'flex', gap: '6px'}}>
                                {['#ff5f57', '#ffbd2e', '#28ca41'].map((c, i) => (
                                    <div key={i}
                                         style={{width: '10px', height: '10px', borderRadius: '50%', background: c}}/>
                                ))}
                            </div>
                            <span style={{fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px'}}>
                test_description.txt
              </span>
                        </div>
                        <span style={{fontSize: '11px', color: 'var(--text-muted)'}}>
              {charCount} chars
            </span>
                    </div>

                    <textarea
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Describe your test case in plain English or Georgian...&#10;&#10;Example: Open the login page, enter email 'test@example.com' and password '123456', click the login button, verify dashboard is visible."
                        style={{
                            flex: 1,
                            minHeight: '280px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            padding: '20px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: '1.8',
                            resize: 'none',
                        }}
                    />

                    <div style={{padding: '12px 20px', borderTop: '1px solid var(--border)'}}>
                        <p style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            marginBottom: '8px',
                            letterSpacing: '0.5px'
                        }}>
                            QUICK EXAMPLES
                        </p>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                            {examples.map((ex, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setText(ex);
                                        setCharCount(ex.length);
                                    }}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '4px 0', textAlign: 'left',
                                    }}
                                >
                                    <ChevronRight size={10} color="var(--accent)"/>
                                    <span style={{fontSize: '11px', color: 'var(--text-secondary)'}}>{ex}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || running || !text.trim()}
                            style={{
                                width: '100%', padding: '12px',
                                background: loading || !text.trim() ? 'var(--bg-hover)' : 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                                border: 'none', borderRadius: '10px',
                                color: loading || !text.trim() ? 'var(--text-muted)' : '#080b10',
                                fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: '600',
                                cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s ease',
                                opacity: loading || running || !text.trim() ? 0.5 : 1,
                            }}
                        >
                            {loading ? (
                                <><Loader2 size={14} style={{animation: 'spin 1s linear infinite'}}/>Generating...</>
                            ) : (
                                <><Code2 size={14}/>Generate Code</>
                            )}
                        </button>

                        <button
                            onClick={handleGenerateAndRun}
                            disabled={loading || running || !text.trim()}
                            style={{
                                width: '100%', padding: '12px',
                                background: 'transparent',
                                border: '1px solid var(--accent-green)',
                                borderRadius: '10px',
                                color: loading || running || !text.trim() ? 'var(--text-muted)' : 'var(--accent-green)',
                                fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: '600',
                                cursor: loading || running || !text.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s ease',
                                opacity: loading || running || !text.trim() ? 0.5 : 1,
                            }}
                        >
                            {running ? (
                                <><Loader2 size={14} style={{animation: 'spin 1s linear infinite'}}/>Running in
                                    browser...</>
                            ) : loading ? (
                                <><Loader2 size={14} style={{animation: 'spin 1s linear infinite'}}/>Generating...</>
                            ) : (
                                <><Play size={14}/>Generate &amp; Run</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Panel */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${code ? 'rgba(0, 255, 136, 0.2)' : 'var(--border)'}`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.3s ease',
                }}>
                    <div style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <Code2 size={14} color={code ? 'var(--accent-green)' : 'var(--text-muted)'}/>
                            <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>generated_test.py</span>
                        </div>

                        {code && (
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button
                                    onClick={handleCopy}
                                    style={{
                                        background: copied ? 'var(--accent-green-dim)' : 'var(--bg-hover)',
                                        border: `1px solid ${copied ? 'var(--accent-green)' : 'var(--border)'}`,
                                        borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease',
                                    }}
                                >
                                    {copied ? (
                                        <><Check size={11} color="var(--accent-green)"/>
                                            <span style={{
                                                fontSize: '11px',
                                                color: 'var(--accent-green)'
                                            }}>Copied!</span></>
                                    ) : (
                                        <><Copy size={11} color="var(--text-secondary)"/>
                                            <span style={{
                                                fontSize: '11px',
                                                color: 'var(--text-secondary)'
                                            }}>Copy</span></>
                                    )}
                                </button>

                                <button
                                    onClick={handleRun}
                                    disabled={running}
                                    style={{
                                        background: running ? 'var(--bg-hover)' : 'var(--accent-green-dim)',
                                        border: `1px solid ${running ? 'var(--border)' : 'var(--accent-green)'}`,
                                        borderRadius: '6px', padding: '4px 10px',
                                        cursor: running ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease',
                                    }}
                                >
                                    {running ? (
                                        <><Loader2 size={11} color="var(--accent-green)"
                                                   style={{animation: 'spin 1s linear infinite'}}/>
                                            <span style={{
                                                fontSize: '11px',
                                                color: 'var(--accent-green)'
                                            }}>Running...</span></>
                                    ) : (
                                        <><Play size={11} color="var(--accent-green)"/>
                                            <span style={{fontSize: '11px', color: 'var(--accent-green)'}}>Run</span></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{flex: 1, overflow: 'auto', minHeight: '320px'}}>
                        {loading ? (
                            <div style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                height: '100%', gap: '16px', padding: '40px',
                            }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    border: '2px solid var(--border)',
                                    borderTop: '2px solid var(--accent)',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                }}/>
                                <p style={{fontSize: '13px', color: 'var(--text-secondary)'}}>bitara is thinking...</p>
                                <p style={{fontSize: '11px', color: 'var(--text-muted)'}}>This may take 30-60 seconds on
                                    CPU</p>
                            </div>
                        ) : error ? (
                            <div style={{padding: '24px'}}>
                                <div style={{
                                    background: 'rgba(255, 80, 80, 0.08)',
                                    border: '1px solid rgba(255, 80, 80, 0.2)',
                                    borderRadius: '8px', padding: '16px',
                                }}>
                                    <p style={{fontSize: '13px', color: '#ff6b6b'}}>{error}</p>
                                </div>
                            </div>
                        ) : code ? (
                            <SyntaxHighlighter
                                language="python"
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0, background: 'transparent',
                                    fontSize: '13px', lineHeight: '1.7',
                                    padding: '20px', minHeight: '100%',
                                }}
                            >
                                {code}
                            </SyntaxHighlighter>
                        ) : (
                            <div style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                height: '100%', gap: '12px', padding: '40px', opacity: 0.4,
                            }}>
                                <Code2 size={40} color="var(--text-muted)"/>
                                <p style={{fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center'}}>
                                    Generated Playwright code<br/>will appear here
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Run Result */}
                    {runResult && (
                        <div style={{
                            margin: '0 20px 20px',
                            padding: '12px 16px',
                            background: runResult.success ? 'rgba(0,255,136,0.06)' : 'rgba(255,80,80,0.06)',
                            border: `1px solid ${runResult.success ? 'rgba(0,255,136,0.2)' : 'rgba(255,80,80,0.2)'}`,
                            borderRadius: '8px',
                        }}>
                            <p style={{
                                fontSize: '12px',
                                color: runResult.success ? 'var(--accent-green)' : '#ff6b6b',
                                marginBottom: runResult.stdout || runResult.stderr ? '8px' : '0',
                                fontWeight: '600',
                            }}>
                                {runResult.success ? '✓ Test Passed' : '✗ Test Failed'}
                            </p>
                            {runResult.stdout && (
                                <pre style={{
                                    fontSize: '11px', color: 'var(--text-secondary)',
                                    whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)',
                                }}>
                  {runResult.stdout}
                </pre>
                            )}
                            {runResult.stderr && (
                                <pre style={{
                                    fontSize: '11px', color: '#ff6b6b',
                                    whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)',
                                }}>
                  {runResult.stderr}
                </pre>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        textarea::placeholder { color: var(--text-muted); }
        button:hover:not(:disabled) { opacity: 0.85; }
      `}</style>
        </main>
    );
}