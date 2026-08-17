$code = @"
using System;
using System.IO;
using System.CodeDom.Compiler;
using Microsoft.JScript;

public class Checker {
    public static void Check(string file) {
        string text = File.ReadAllText(file);
        try {
            Microsoft.JScript.Eval.JScriptEvaluate(text, Microsoft.JScript.Vsa.VsaEngine.CreateEngine());
            Console.WriteLine("OK");
        } catch (Exception ex) {
            Console.WriteLine(ex.Message);
        }
    }
}
"@
Add-Type -TypeDefinition $code -ReferencedAssemblies "Microsoft.JScript"
[Checker]::Check(".\js\escolas.js")
