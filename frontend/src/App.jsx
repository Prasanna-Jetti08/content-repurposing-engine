import React, { useState, useRef } from "react";
import { Upload, Link as LinkIcon, FileText, Copy, CheckCircle, AlertCircle, Sparkles, Loader, Moon, Sun, ArrowLeft } from "lucide-react";
import "./App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home"); // "home" or "repurpose"
  const [theme, setTheme] = useState("dark"); // "dark" or "light"
  const [inputType, setInputType] = useState("text"); // "text", "url", "file"
  const [outputFormats, setOutputFormats] = useState([]); // Selected output formats
  
  const [inputText, setInputText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputs, setOutputs] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const fileRef = useRef();

  const outputOptions = [
    { id: "linkedin_post", label: "LinkedIn Post", icon: "💼" },
    { id: "twitter_thread", label: "Twitter/X Thread", icon: "𝕏" },
    { id: "short_blog", label: "Blog Post (500-700w)", icon: "📝" },
    { id: "youtube_script", label: "YouTube Script", icon: "▶️" },
  ];

  const toggleOutputFormat = (id) => {
    setOutputFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleStartClick = () => {
    if (outputFormats.length === 0) {
      alert("Please select at least one output format");
      return;
    }
    setCurrentPage("repurpose");
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setOutputs(null);

    if (!inputText.trim() && !url.trim() && !file) {
      setError("Please provide text, URL, or upload a file.");
      return;
    }

    setIsProcessing(true);
    try {
      const form = new FormData();
      if (file) form.append("file", file);
      if (url) form.append("url", url);
      if (inputText) form.append("text", inputText);

      const res = await fetch("/api/repurpose", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Server error");
      }

      const data = await res.json();
      
      // Filter outputs based on selected formats
      const filteredOutputs = {};
      outputFormats.forEach((format) => {
        if (data[format]) {
          filteredOutputs[format] = data[format];
        }
      });
      
      setOutputs(filteredOutputs);
      window.setTimeout(() => {
        document.getElementById("outputs")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile ?? null);
  };

  const clearAll = () => {
    setInputText("");
    setUrl("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setOutputs(null);
    setError(null);
    setCopied(null);
  };

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(typeof content === "string" ? content : JSON.stringify(content));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (currentPage === "home") {
    return (
      <div className={`app-container ${theme}`}>
        <div className="app-background">
          <div className="blob blob-purple"></div>
          <div className="blob blob-blue"></div>
          <div className="blob blob-pink"></div>
        </div>

        {/* Navigation Header */}
        <header className="header">
          <div className="header-left">
            <h1 className="app-title" style={{ margin: 0, fontSize: "1.5rem" }}>Repurpose Engine</h1>
          </div>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <div className="app-content">
          {/* Header */}
          <header className="app-header">
            <div className="header-icon">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="app-title">Content Repurposing Engine</h1>
            <p className="app-subtitle">
              Choose your output formats and start repurposing content instantly
            </p>
          </header>

          {/* Main Content */}
          <div className="main-container">
            <div className="form-wrapper">
              {/* Output Format Selection */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">What formats do you need?</h2>
                </div>
                <div className="card-content">
                  <div className="format-grid">
                    {outputOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleOutputFormat(option.id)}
                        className={`format-option ${
                          outputFormats.includes(option.id) ? "selected" : ""
                        }`}
                      >
                        <span className="format-icon">{option.icon}</span>
                        <span className="format-label">{option.label}</span>
                        {outputFormats.includes(option.id) && (
                          <CheckCircle className="w-5 h-5 format-check" />
                        )}
                      </button>
                    ))}
                  </div>

                  <button onClick={handleStartClick} className="btn btn-primary btn-large">
                    <Sparkles className="w-5 h-5" />
                    Continue with {outputFormats.length} format{outputFormats.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="app-footer">
            <p>Select your desired output formats to get started</p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${theme}`}>
      {/* Animated background elements */}
      <div className="app-background">
        <div className="blob blob-purple"></div>
        <div className="blob blob-blue"></div>
        <div className="blob blob-pink"></div>
      </div>

      <div className="app-content">
        {/* Navigation Header */}
        <header className="header">
          <div className="header-left">
            <button
              onClick={() => {
                setCurrentPage("home");
                clearAll();
              }}
              className="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Header with Back Button */}
        <header className="app-header">
          <div className="header-icon">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="app-title">Repurpose Your Content</h1>
          <p className="app-subtitle">
            For: {outputFormats.map((f) => outputOptions.find((o) => o.id === f)?.label).join(", ")}
          </p>
        </header>

        {/* Main Container */}
        <div className="main-container">
          <div className="form-wrapper">
            {/* Input Section Card */}
            <div className="card">
              <div className="card-content">
                <form onSubmit={submit} className="form">
                  {/* Input Type Tabs */}
                  <div className="input-tabs">
                    {[
                      { type: "text", label: "📝 Text", icon: FileText },
                      { type: "url", label: "🔗 URL", icon: LinkIcon },
                      { type: "file", label: "📁 File", icon: Upload },
                    ].map((tab) => (
                      <button
                        key={tab.type}
                        type="button"
                        className={`input-tab ${inputType === tab.type ? "active" : ""}`}
                        onClick={() => {
                          setInputType(tab.type);
                          setError(null);
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Input Grid */}
                  <div className="input-grid single">
                    {inputType === "text" && (
                      <div className="input-group">
                        <label className="input-label">
                          <FileText className="label-icon" />
                          Paste Your Content
                        </label>
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Paste your long-form content, article, or text here..."
                          className="textarea"
                        />
                      </div>
                    )}

                    {inputType === "url" && (
                      <div className="input-group">
                        <label className="input-label">
                          <LinkIcon className="label-icon" />
                          Article URL
                        </label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://example.com/article"
                          className="input-text"
                        />
                        <p className="input-hint">We'll extract and repurpose the article content</p>
                      </div>
                    )}

                    {inputType === "file" && (
                      <div className="input-group">
                        <label className="input-label">
                          <Upload className="label-icon" />
                          Upload Document
                        </label>
                        <div className="file-input-wrapper">
                          <input
                            ref={fileRef}
                            onChange={onFileChange}
                            type="file"
                            accept=".pdf,.docx,.pptx,.ppt,.txt"
                            style={{ display: "none" }}
                          />
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="file-input-button"
                          >
                            {file ? (
                              <>
                                <CheckCircle className="w-5 h-5 check-icon" />
                                {file.name}
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5" />
                                Click to upload (PDF, DOCX, PPTX, TXT)
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="button-group">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="btn btn-primary"
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="btn-icon spinner" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="btn-icon" />
                          Repurpose Content
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={clearAll}
                      className="btn btn-secondary"
                    >
                      Clear All
                    </button>

                    {isProcessing && (
                      <div className="processing-text">
                        <Loader className="w-4 h-4 spinner" />
                        Generating magic...
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="error-message">
                      <AlertCircle className="error-icon" />
                      <span className="error-text">{error}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Outputs Section */}
            {outputs && (
              <section id="outputs" className="outputs-section">
                <h2 className="outputs-title">Your Repurposed Content</h2>
                
                {outputs.linkedin_post && (
                  <OutputCard
                    title="💼 LinkedIn Post"
                    content={outputs.linkedin_post}
                    onCopy={() => handleCopy(outputs.linkedin_post, "linkedin")}
                    copied={copied === "linkedin"}
                  />
                )}
                
                {outputs.twitter_thread && (
                  <OutputCard
                    title="𝕏 Twitter Thread"
                    content={outputs.twitter_thread?.join("\n\n") || ""}
                    preformatted
                    onCopy={() => handleCopy(outputs.twitter_thread?.join("\n\n"), "twitter")}
                    copied={copied === "twitter"}
                  />
                )}
                
                {outputs.short_blog && (
                  <OutputCard
                    title="📝 Blog Post"
                    content={outputs.short_blog}
                    onCopy={() => handleCopy(outputs.short_blog, "blog")}
                    copied={copied === "blog"}
                  />
                )}
                
                {outputs.youtube_script && (
                  <OutputCard
                    title="▶️ YouTube Script"
                    content={outputs.youtube_script}
                    onCopy={() => handleCopy(outputs.youtube_script, "youtube")}
                    copied={copied === "youtube"}
                  />
                )}
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <p>Transform your content across platforms instantly</p>
        </footer>
      </div>
    </div>
  );
}

function OutputCard({ title, content, preformatted = false, onCopy, copied }) {
  if (!content) return null;
  return (
    <div className="output-card">
      <div className="output-header">
        <h3 className="output-title">{title}</h3>
        <button
          onClick={onCopy}
          className={`copy-button ${copied ? "copied" : ""}`}
        >
          {copied ? (
            <CheckCircle className="copy-icon" />
          ) : (
            <Copy className="copy-icon" />
          )}
        </button>
      </div>

      <div className="output-content">
        {preformatted ? (
          <pre className="output-preformatted">{content}</pre>
        ) : (
          <div>
            {content.split("\n").map((para, idx) => (
              <p key={idx} className="output-text">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
