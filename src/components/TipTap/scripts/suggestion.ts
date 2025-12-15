import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance } from "tippy.js"; // Importar o tipo Instance do tippy
import { Editor, Range } from "@tiptap/core"; // Importar tipos do Tiptap
import CommandList from "../CommandList";

// Interface para definir o formato dos seus itens de menu
interface CommandItemProps {
  title: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const getSuggestionOptions = (
  variables: { id: string; label: string }[]
) => ({
  char: "/",

  // Tipagem explícita dos parâmetros query e editor
  items: ({
    query,
    editor,
  }: {
    query: string;
    editor: Editor;
  }): CommandItemProps[] => {
    const items: CommandItemProps[] = [
      {
        title: "Título 1",
        icon: "H1",
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 1 })
            .run(),
      },
      {
        title: "Título 2",
        icon: "H2",
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 2 })
            .run(),
      },
      {
        title: "Título 3",
        icon: "H3", // Vamos adicionar mapeamento para H3
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 3 })
            .run(),
      },
      {
        title: "Lista",
        icon: "List",
        command: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleBulletList().run(),
      },
      {
        title: "Citação",
        icon: "Quote",
        command: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
      },
      {
        title: "Destaque (Callout)",
        icon: "Callout",
        command: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleCallout().run(),
      },
      {
        title: "Divisor",
        icon: "Divider",
        command: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
      },
      {
        title: "Tabela",
        icon: "Table",
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
      },
      {
        title: "Cabeçalho Documento",
        icon: "Layout",
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).run();

          editor
            .chain()
            .insertContentAt(0, {
              type: "table",
              attrs: {
                layout: "header", // Isso agora será mapeado para data-layout="header"
                class: "w-full border-none select-none",
              },
              content: [
                {
                  type: "tableRow",
                  content: [
                    {
                      type: "tableCell",
                      attrs: {
                        colwidth: [100],
                        class: "align-middle border-r p-4",
                      },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "LOGO" }],
                        },
                      ],
                    },
                    {
                      type: "tableCell",
                      attrs: { class: "align-middle p-4" },
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 2 },
                          content: [{ type: "text", text: "Empresa S.A." }],
                        },
                      ],
                    },
                  ],
                },
              ],
            })
            .run();
        },
      },
    ];

    const variableItems: CommandItemProps[] = variables.map((v) => ({
      title: `Var: ${v.label}`,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: "variable",
            attrs: { id: v.id, label: v.label },
          })
          .run();
      },
      icon: "Variable",
    }));

    const allItems = [...items, ...variableItems];

    return allItems
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  },

  render: () => {
    // Tipagem das variáveis que guardam as referências
    let component: ReactRenderer | null = null;
    let popup: Instance[] | null = null;

    return {
      onStart: (props: any) => {
        // Props aqui vem do Tiptap Suggestion
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;

        // O tippy retorna um array de instâncias, por isso o tipo Instance[]
        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as any, // as any às vezes é necessário para compatibilidade de DOMRect
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: any) {
        component?.updateProps(props);

        if (!props.clientRect) return;

        popup?.[0].setProps({
          getReferenceClientRect: props.clientRect as any,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup?.[0].hide();
          return true;
        }
        // O ref do ReactRenderer pode ser any porque depende do componente filho (CommandList)
        return (component?.ref as any)?.onKeyDown(props);
      },

      onExit() {
        popup?.[0].destroy();
        component?.destroy();
        popup = null;
        component = null;
      },
    };
  },
});
