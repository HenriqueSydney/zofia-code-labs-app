"use client";

import React, { useEffect, useRef, useState } from "react";
// Importe o CSS do Tippy para os menus funcionarem!
import "tippy.js/dist/tippy.css";

import {
  useEditor,
  EditorContent,
  JSONContent,
  Extension,
} from "@tiptap/react";
import { DOMParser as ProseMirrorDOMParser } from "prosemirror-model";
import { Editor as CoreEditor, Range } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Suggestion from "@tiptap/suggestion";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import CalloutExtension from "./scripts/callout-extension";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import { FontSize } from "./scripts/font-size-extension";
import DragHandle from "./DragHandle";
import VariableExtension from "./scripts/variable-extension";
import { getSuggestionOptions } from "./scripts/suggestion";
import Image from "@tiptap/extension-image";
import "./editor-styles.css";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Toolbar } from "./Toolbar";
import { Ruler } from "./Ruler";
import { VerticalRuler } from "./VerticalRuler";
import { PageBreak } from "./scripts/page-break-extension";

// --- Extensão Slash Command ---
const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: CoreEditor;
          range: Range;
          props: any;
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

interface EditorProps {
  initialContent?: JSONContent | string;
  variables?: { id: string; label: string }[];
  onChange?: (json: JSONContent) => void;
}

const Editor: React.FC<EditorProps> = ({
  initialContent,
  variables = [],
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { uploadFn } = useImageUpload();
  const [margins, setMargins] = useState({
    left: 3,
    right: 2,
    top: 3,
    bottom: 2,
  });
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit já inclui Heading, Bold, Italic, BulletList, Quote, HorizontalRule
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }, // Habilita até H4
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "my-custom-table w-full",
        },
      }).extend({
        addAttributes() {
          return {
            // Herda atributos padrões
            ...this.parent?.(),
            // 1. Permite passar classes customizadas
            class: {
              default: null,
              parseHTML: (element) => element.getAttribute("class"),
              renderHTML: (attributes) => {
                if (!attributes.class) return {};
                return { class: attributes.class };
              },
            },
            // 2. Permite passar estilos inline (útil para ajustes finos)
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute("style"),
              renderHTML: (attributes) => {
                if (!attributes.style) return {};
                return { style: attributes.style };
              },
            },
            // 3. O Identificador do Layout (Fundamental para o CSS)
            layout: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-layout"),
              renderHTML: (attributes) => {
                if (!attributes.layout) return {};
                return { "data-layout": attributes.layout };
              },
            },
          };
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      VariableExtension,
      FontSize,
      // NOVAS EXTENSÕES
      Link.configure({ openOnClick: false }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      PageBreak,
      TextStyle,
      Strike,
      Color,
      CalloutExtension,
      BubbleMenuExtension,
      SlashCommand.configure({
        suggestion: getSuggestionOptions(variables),
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading")
            return `Título ${node.attrs.level}...`;
          return 'Digite "/" para comandos...';
        },
        includeChildren: true,
        showOnlyCurrent: true,
      }),
      Image.configure({
        allowBase64: true, // Desabilita base64 nativo para forçar URL
        HTMLAttributes: {
          class: "rounded-lg border border-gray-200 shadow-sm max-w-full my-4",
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        // CORREÇÃO: Usar apenas 'prose' para tamanho padrão.
        // Adicionamos estilos específicos para o Callout aqui via Tailwind class
        class: "prose prose-slate max-w-none min-h-[500px] focus:outline-none",
      },
      handlePaste: (view, event) => {
        // 1. Tenta pegar o texto puro da área de transferência
        const text = event.clipboardData?.getData("text/plain");

        // 2. Verifica se o texto contém tags HTML (ex: <h2>, <p>, <ul>)
        const isHTML = /<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/i.test(text || "");

        // Se tiver imagem (o código que você já tinha), deixa passar para o handler de imagem
        const items = Array.from(event.clipboardData?.items || []);
        const hasImage = items.some((item) => item.type.startsWith("image"));

        if (hasImage) {
          // ... sua lógica de upload de imagem existente ...
          // Lembre de retornar true se tratar a imagem
          return false; // Retorna false aqui para deixar seu handler de imagem abaixo rodar ou move a lógica para cá
        }

        // 3. A MÁGICA: Se for texto puro MAS parecer HTML
        if (text && isHTML && !hasImage) {
          event.preventDefault();

          // A. Cria um parser nativo do browser para transformar string em DOM
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "text/html");

          // B. Usa o parser do ProseMirror para transformar DOM em Nodes do Editor
          // Usa o schema atual do editor (que sabe o que é h1, table, etc)
          const pmParser = ProseMirrorDOMParser.fromSchema(view.state.schema);
          const slice = pmParser.parseSlice(doc.body);

          // C. Insere o conteúdo interpretado na posição do cursor
          const transaction = view.state.tr.replaceSelection(slice);
          view.dispatch(transaction);

          return true; // Diz ao editor: "Eu cuidei disso, não faça o padrão"
        }

        // Se for texto normal ou imagem, deixa o comportamento padrão (ou sua lógica de imagem) seguir
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files[0]
        ) {
          const file = event.dataTransfer.files[0];
          if (file.type.indexOf("image") === 0) {
            event.preventDefault();

            uploadFn(file).then((url) => {
              const { schema } = view.state;
              // Pega a coordenada onde soltou o mouse
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.insert(
                coordinates?.pos || 0,
                node
              );
              view.dispatch(transaction);
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor || !initialContent) return;

    // Pega o conteúdo atual do editor
    const currentContent = editor.getHTML();

    // Se o conteúdo for diferente (evita loop infinito), atualiza
    // O setContent força o Tiptap a interpretar as tags HTML
    if (initialContent !== currentContent) {
      // Tenta detectar se o conteúdo veio "escapado" (ex: &lt;h2&gt;) e desescapa
      // Isso corrige casos onde o HTML foi salvo como texto puro no banco
      let contentToSet = initialContent;

      if (
        typeof initialContent === "string" &&
        initialContent.includes("&lt;")
      ) {
        const txt = document.createElement("textarea");
        txt.innerHTML = initialContent;
        contentToSet = txt.value; // Agora é <h2>...</h2> e não &lt;h2&gt;
      }

      editor.commands.setContent(contentToSet, { emitUpdate: false });
    }
  }, [initialContent, editor]);

  if (!editor) return null;

  return (
    // CONTAINER PRINCIPAL ("MESA"): Fundo cinza escuro para contraste
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-800 p-4 md:p-8 gap-4">
      {/* TOOLBAR/HEADER FLUTUANTE OU FIXO ACIMA DA FOLHA */}
      <div className="w-full max-w-[21cm] flex justify-between items-center text-sm text-muted-foreground px-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">
            Editor de Documento
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-xs">
            <span className="font-bold">Dica:</span> Digite{" "}
            <code className="bg-gray-200 px-1 rounded border border-gray-300">
              /
            </code>{" "}
            para comandos
          </span>
        </div>
        {/* Você pode colocar botões de salvar aqui */}
        <div className="text-xs text-gray-400">Rascunho salvo</div>
      </div>

      <div className="relative mx-auto">
        <EditorBubbleMenu editor={editor} />

        {/* 1. Toolbar Superior (Fora do grid de réguas) */}

        <Toolbar editor={editor} variables={variables} />

        {/* 2. Área de Trabalho (Réguas + Papel) */}
        <div className="flex flex-row items-start overflow-y-auto max-h-[32cm] bg-background border-x border-b rounded-b-lg">
          {/* COLUNA DA RÉGUA VERTICAL */}
          <div className="flex flex-col flex-none items-center justify-center mt-6">
            {/* O "CORNER": Espaço vazio onde as réguas se cruzariam. 
          Deve ser transparente ou da cor da régua, NÃO bg-background. */}
            <div className="h-8 w-8 border-l border-t border-transparent" />

            <VerticalRuler
              marginTop={margins.top}
              marginBottom={margins.bottom}
              onMarginChange={(top, bottom) =>
                setMargins({ ...margins, top, bottom })
              }
            />
          </div>

          {/* COLUNA DA RÉGUA HORIZONTAL + FOLHA */}
          <div className="flex flex-col flex-none items-center justify-center">
            <Ruler
              marginLeft={margins.left}
              marginRight={margins.right}
              onMarginChange={(left, right) =>
                setMargins({ ...margins, left, right })
              }
            />

            {/* O CONTAINER DA FOLHA: 
          Aqui removemos o 'bg-background' do pai para evitar o ghost background. */}
            <div className="p-6 ">
              <div className="paginated-container">
                <div
                  className="prose-paper bg-white shadow-2xl border border-gray-200 cursor-text "
                  style={
                    {
                      width: "21cm",
                      height: "29.7cm",
                      paddingLeft: `${margins.left}cm`,
                      paddingRight: `${margins.right}cm`,
                      paddingTop: `${margins.top}cm`,
                      paddingBottom: `${margins.bottom}cm`,
                    } as React.CSSProperties
                  }
                >
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RODAPÉ DO VISUALIZADOR (Opcional) */}
      <div className="text-xs text-gray-400 mt-4 mb-8">Fim do documento</div>
    </div>
  );
};

export default Editor;
