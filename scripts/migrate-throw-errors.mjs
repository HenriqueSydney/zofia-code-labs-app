#!/usr/bin/env node
/**
 * Migra throw new Error / throw new AppError para classes semânticas em src/errors.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");

const SKIP_DIRS = new Set(["node_modules", ".next", "dist"]);
const ERROR_CLASS_IMPORTS = new Map();

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx)$/.test(ent.name) && !ent.name.endsWith(".spec.ts"))
      files.push(p);
  }
  return files;
}

function classifyMessage(msg) {
  const m = msg.trim();
  const lower = m.toLowerCase();

  if (
    /useformfield|usesidebar|must be used within|should be used within/i.test(m)
  )
    return "InvariantViolationError";

  if (lower.includes("invalid environment")) return "ConfigurationError";

  if (
    /brasilapi|viacep|infisical|umami|sonarqube|defectdojo|cora|documenso|github|storage|r2|cep|falha ao|falha na|api error|\[.* error\]/i.test(
      m,
    ) &&
    !lower.includes("não encontrad") &&
    !lower.includes("not found")
  )
    return "ExternalServiceError";

  if (
    /integração|integration|umami|sonarqube|github|website não configurado|estratégia não definida/i.test(
      m,
    ) &&
    (lower.includes("não encontrad") ||
      lower.includes("não configurad") ||
      lower.includes("not found"))
  )
    return "IntegrationError";

  if (
    lower.includes("já existe") ||
    lower.includes("already exists") ||
    lower.includes("duplicad")
  )
    return "ConflictError";

  if (
    lower.includes("não é possível") ||
    lower.includes("não pode") ||
    lower.includes("não foi possível excluir") ||
    lower.includes("cannot") ||
    lower.includes("incorreta") ||
    lower.includes("inválid") && lower.includes("transição") ||
    lower.includes("arquivad") ||
    lower.includes("assinad") ||
    lower.includes("cancelad") && lower.includes("excluir") ||
    lower.includes("negativo") ||
    lower.includes("acesso negado ao template")
  )
    return "BusinessRuleError";

  if (
    lower.includes("não autorizado") ||
    lower.includes("não autenticado") ||
    lower.includes("não logado") ||
    lower.includes("not authenticated") ||
    lower.includes("sessionexpired")
  )
    return "UnauthorizedError";

  if (
    lower.includes("acesso negado") ||
    lower.includes("não tem acesso") ||
    lower.includes("não tem permissão") ||
    lower.includes("permission denied")
  )
    return "ForbiddenError";

  if (
    lower.includes("não encontrad") ||
    lower.includes("não localizad") ||
    lower.includes("not found") ||
    lower.includes("não configurada") && lower.includes("integração")
  )
    return "ResourceNotFoundError";

  if (
    lower.includes("inválid") ||
    lower.includes("muito grande") ||
    lower.includes("não permitido") ||
    lower.includes("não é um arquivo") ||
    lower.includes("não é uma imagem") ||
    lower.includes("vazio") ||
    lower.includes("corrompido") ||
    lower.includes("limite") ||
    lower.includes("parâmetros") && lower.includes("inválid")
  )
    return "ValidationError";

  return "ValidationError";
}

function classifyAppErrorThrow(content, startIdx) {
  const slice = content.slice(startIdx, startIdx + 800);
  const msgMatch = slice.match(/throw new AppError\s*\(\s*([^,]+)/);
  if (!msgMatch) return "ValidationError";
  const arg = msgMatch[1].trim();
  if (/^["'`]/.test(arg)) {
    const msg = arg.slice(1).replace(/^["'`]/, "").split(/["'`]/)[0];
    return classifyMessage(msg);
  }
  if (arg.includes("sessionExpired") || arg.includes("Não autorizado"))
    return "UnauthorizedError";
  return "ValidationError";
}

function extractThrowExpressions(content) {
  const results = [];
  const re = /throw new (Error|AppError)\s*\(/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const kind = m[1];
    const start = m.index;
    const openParen = m.index + m[0].length - 1;
    let depth = 0;
    let i = openParen;
    let inStr = null;
    let escape = false;
    for (; i < content.length; i++) {
      const ch = content[i];
      if (inStr) {
        if (escape) escape = false;
        else if (ch === "\\") escape = true;
        else if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = ch;
        continue;
      }
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          results.push({
            kind,
            start,
            end: i + 1,
            full: content.slice(start, i + 1),
            inner: content.slice(openParen + 1, i),
          });
          break;
        }
      }
    }
  }
  return results;
}

function parseAppErrorArgs(inner) {
  const trimmed = inner.trim();
  const firstComma = findTopLevelComma(trimmed);
  const messagePart = firstComma === -1 ? trimmed : trimmed.slice(0, firstComma);
  const rest = firstComma === -1 ? "" : trimmed.slice(firstComma + 1).trim();

  const message = messagePart.trim();
  let statusCode;
  let severity;
  let sendSupport;
  let options;

  if (rest) {
    const parts = splitTopLevelArgs(rest);
    if (parts[0] && /^\d+$/.test(parts[0])) statusCode = parts[0];
    if (parts[1] && /^["'](low|medium|high)["']$/.test(parts[1]))
      severity = parts[1].replace(/["']/g, "");
    const optionsIdx = rest.indexOf("i18nKey");
    if (optionsIdx !== -1) {
      const optStart = rest.indexOf("{", optionsIdx);
      if (optStart !== -1) {
        let d = 0;
        for (let j = optStart; j < rest.length; j++) {
          if (rest[j] === "{") d++;
          else if (rest[j] === "}") {
            d--;
            if (d === 0) {
              options = rest.slice(optStart, j + 1);
              break;
            }
          }
        }
      }
    }
  }

  return { message, statusCode, severity, sendSupport, options, rest };
}

function findTopLevelComma(s) {
  let depth = 0;
  let inStr = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (ch === inStr && s[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") inStr = ch;
    else if (ch === "(" || ch === "{") depth++;
    else if (ch === ")" || ch === "}") depth--;
    else if (ch === "," && depth === 0) return i;
  }
  return -1;
}

function splitTopLevelArgs(s) {
  const parts = [];
  let cur = "";
  let depth = 0;
  let inStr = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      cur += ch;
      if (ch === inStr && s[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "{") depth++;
    else if (ch === ")" || ch === "}") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function buildReplacement(className, inner, kind) {
  const trimmed = inner.trim();

  if (kind === "Error") {
    const msg = trimmed.replace(/^["'`]|["'`]$/g, "");
    const cls = classifyMessage(msg);

    if (cls === "ExternalServiceError") {
      if (msg.includes("[") && msg.includes("]")) {
        const bracket = msg.match(/\[([^\]]+)\]/);
        const service = bracket ? bracket[1] : "Serviço externo";
        const detail = msg.replace(/^\[[^\]]+\]\s*/, "");
        return `throw new ExternalServiceError(${JSON.stringify(service)}, ${JSON.stringify(detail)})`;
      }
      if (/Falha|Error|falha/i.test(msg)) {
        const service = msg.includes("Umami")
          ? "Umami"
          : msg.includes("Infisical")
            ? "Infisical"
            : msg.includes("CEP") || msg.includes("ViaCEP") || msg.includes("BrasilAPI")
              ? "CEP"
              : msg.includes("storage") || msg.includes("Storage")
                ? "Storage"
                : msg.includes("Documenso")
                  ? "Documenso"
                  : "Serviço externo";
        return `throw new ExternalServiceError(${JSON.stringify(service)}, ${trimmed})`;
      }
    }

    if (cls === "IntegrationError") {
      return `throw new IntegrationError(${trimmed})`;
    }

    if (cls === "ResourceNotFoundError") {
      return `throw new ResourceNotFoundError(${trimmed})`;
    }

    if (cls === "ConfigurationError") {
      return `throw new ConfigurationError(${trimmed})`;
    }

    if (cls === "InvariantViolationError") {
      return `throw new InvariantViolationError(${trimmed})`;
    }

    if (cls === "ConflictError") {
      return `throw new ConflictError(${trimmed})`;
    }

    if (cls === "BusinessRuleError") {
      return `throw new BusinessRuleError(${trimmed})`;
    }

    if (cls === "ForbiddenError") {
      return `throw new ForbiddenError(${trimmed})`;
    }

    if (cls === "UnauthorizedError") {
      return `throw new UnauthorizedError(${trimmed})`;
    }

    return `throw new ${cls}(${trimmed})`;
  }

  // AppError
  const parsed = parseAppErrorArgs(trimmed);
  const cls = classifyAppErrorThrow(`throw new AppError(${trimmed})`, 0);

  if (parsed.options) {
    if (cls === "UnauthorizedError") {
      return `throw new UnauthorizedError(${parsed.message}, { ${parsed.options.replace(/^\{|\}$/g, "").trim()} })`;
    }
    if (cls === "ForbiddenError") {
      return `throw new ForbiddenError(${parsed.message}, { ${parsed.options.replace(/^\{|\}$/g, "").trim()} })`;
    }
  }

  if (cls === "ResourceNotFoundError") {
    if (parsed.statusCode && parsed.statusCode !== "404") {
      return `throw new ResourceNotFoundError(${parsed.message}, { statusCode: ${parsed.statusCode} })`;
    }
    return `throw new ResourceNotFoundError(${parsed.message})`;
  }

  if (cls === "UnauthorizedError") {
    return `throw new UnauthorizedError(${parsed.message})`;
  }

  if (cls === "ForbiddenError") {
    return `throw new ForbiddenError(${parsed.message})`;
  }

  if (cls === "IntegrationError") {
    if (parsed.statusCode) {
      return `throw new IntegrationError(${parsed.message}, { statusCode: ${parsed.statusCode} })`;
    }
    return `throw new IntegrationError(${parsed.message})`;
  }

  if (cls === "BusinessRuleError") {
    if (parsed.statusCode) {
      return `throw new BusinessRuleError(${parsed.message}, { statusCode: ${parsed.statusCode} })`;
    }
    return `throw new BusinessRuleError(${parsed.message})`;
  }

  if (cls === "ValidationError") {
    const opts = [];
    if (parsed.statusCode) opts.push(`statusCode: ${parsed.statusCode}`);
    if (parsed.severity) opts.push(`severity: "${parsed.severity}"`);
    if (parsed.options) {
      const ok = parsed.options.match(/i18nKey:\s*["']([^"']+)["']/);
      if (ok) opts.push(`i18nKey: "${ok[1]}"`);
    }
    if (opts.length)
      return `throw new ValidationError(${parsed.message}, { ${opts.join(", ")} })`;
    return `throw new ValidationError(${parsed.message})`;
  }

  return `throw new ${cls}(${parsed.message})`;
}

function ensureImport(content, classes) {
  const needed = [...classes].filter((c) => c !== "AppError");
  if (!needed.length) return content;

  const existingFromErrors = new Set();
  const importRe =
    /import\s*\{([^}]+)\}\s*from\s*["']@\/errors(?:\/[^"']+)?["']/g;
  let m;
  while ((m = importRe.exec(content)) !== null) {
    m[1].split(",").forEach((s) => {
      const name = s.trim().split(/\s+as\s+/)[0].trim();
      if (name) existingFromErrors.add(name);
    });
  }

  const toAdd = needed.filter((c) => !existingFromErrors.has(c));
  if (!toAdd.length) return content;

  const importLine = `import { ${toAdd.join(", ")} } from "@/errors";\n`;

  const hasAppErrorOnly =
    content.includes('from "@/errors/AppError"') && !content.includes("@/errors/index");

  if (hasAppErrorOnly && needed.includes("AppError") === false) {
    const appImport = content.match(
      /import\s*\{([^}]+)\}\s*from\s*["']@\/errors\/AppError["']/,
    );
    if (appImport) {
      const names = appImport[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const merged = [...new Set([...names, ...toAdd])];
      content = content.replace(
        appImport[0],
        `import { ${merged.join(", ")} } from "@/errors"`,
      );
      return content;
    }
  }

  const firstImport = content.match(/^import\s/m);
  if (firstImport) {
    const idx = content.indexOf(firstImport[0]);
    return content.slice(0, idx) + importLine + content.slice(idx);
  }
  return importLine + content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  if (!/throw new (Error|AppError)\s*\(/.test(content)) return false;

  const throws = extractThrowExpressions(content);
  if (!throws.length) return false;

  const classesUsed = new Set();
  let offset = 0;
  const replacements = [];

  for (const t of throws) {
    const clsName = (() => {
      if (t.kind === "Error") {
        const msg = t.inner.trim().replace(/^["'`]|["'`]$/g, "");
        return classifyMessage(msg);
      }
      return classifyAppErrorThrow(content, t.start);
    })();
    classesUsed.add(clsName);
    const replacement = buildReplacement(clsName, t.inner, t.kind);
    replacements.push({ start: t.start, end: t.end, replacement });
  }

  replacements.sort((a, b) => b.start - a.start);
  for (const r of replacements) {
    content = content.slice(0, r.start) + r.replacement + content.slice(r.end);
  }

  content = ensureImport(content, classesUsed);

  fs.writeFileSync(filePath, content);
  return true;
}

let count = 0;
for (const f of walk(SRC)) {
  if (f.includes("/errors/") && !f.endsWith("index.ts")) continue;
  if (processFile(f)) {
    count++;
    console.log("updated:", path.relative(ROOT, f));
  }
}
console.log(`\nTotal: ${count} files`);
