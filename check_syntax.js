var fso = new ActiveXObject("Scripting.FileSystemObject");
try {
    var file = fso.OpenTextFile("js/escolas.js", 1);
    var content = file.ReadAll();
    file.Close();
    
    // Evaluate the content to find syntax errors
    eval(content);
    WScript.Echo("Syntax OK!");
} catch (e) {
    WScript.Echo("Syntax Error: " + e.description);
    // e.line is often not available for eval, but let's try
    WScript.Echo("Line: " + (e.line || "unknown"));
}
