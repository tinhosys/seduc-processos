const fs = require('fs');
let content = fs.readFileSync('js/auth-sap.js', 'utf8');

const strToFind = `    }
  }
  }
}

// Exibe a tela de login`;

const idx = content.indexOf(strToFind);
if (idx > -1) {
  content = content.replace(strToFind, `    }
  }
}

// Exibe a tela de login`);
  fs.writeFileSync('js/auth-sap.js', content);
  console.log('fixed extra brace');
} else {
  console.log('could not find string to replace');
}
