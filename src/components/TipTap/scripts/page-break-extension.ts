import { Node, mergeAttributes } from "@tiptap/core";

// 1. Defina a interface para o TypeScript reconhecer o comando
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * Insere uma quebra de página visual e para o PDF
       */
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  // Permite que o comando seja inserido entre parágrafos
  content: "inline*",
  inline: false,
  selectable: true,
  draggable: true,

  parseHTML() {
    return [{ tag: 'div[data-type="page-break"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "page-break",
        class: "page-break-divider",
      }),
      ["span", {}, "Quebra de Página"],
    ];
  },

  // 2. Implemente o comando respeitando a nova tipagem
  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});
