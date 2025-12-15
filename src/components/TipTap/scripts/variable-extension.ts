import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import VariableComponent from "../VariableComponent"; // <--- Importe o arquivo criado acima

export default Node.create({
  name: "variable",
  group: "inline",
  inline: true,
  atom: true, // Define que é um bloco único (não dá para editar metade da variável)

  addAttributes() {
    return {
      id: {
        default: null,
      },
      label: {
        default: "Variável",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-variable]", // Lê do HTML salvo
        getAttrs: (element) => {
          // Recupera os atributos do HTML para o JSON do Tiptap
          if (typeof element === "string") return {};
          return {
            id: element.getAttribute("data-variable"),
            label: element.innerText, // Ou outro atributo se preferir salvar o label no data
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    // Como será salvo no HTML/Banco (para visualizadores que não usam Tiptap)
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-variable": HTMLAttributes.id,
        class: "variable-chip",
      }),
      node.attrs.label,
    ];
  },

  addNodeView() {
    // Conecta o Componente React ao Tiptap
    return ReactNodeViewRenderer(VariableComponent);
  },
});
