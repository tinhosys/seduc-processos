const fs = require('fs');
let content = fs.readFileSync('js/auth-sap.js', 'utf8');

// I will just replace the exact matching part with one less brace.
content = content.replace(`    }
  }
  }
}

// Exibe a tela de login`, `    }
  }
}

// Exibe a tela de login`);

fs.writeFileSync('js/auth-sap.js', content);
console.log('patched syntax');
