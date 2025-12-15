import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus"; // Importação padrão recomendada

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon, // Renomeei para evitar conflito com componente Link do next se houver
  Palette,
  Type,
  ChevronDown,
  Scaling,
  AlignLeft,
  AlignCenter,
} from "lucide-react";
import { useEffect, useState } from "react";

interface EditorBubbleMenuProps {
  editor: Editor;
}

export const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [tempColor, setTempColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(16);

  if (!editor) return null;

  const colors = ["#000000", "#ef4444", "#22c55e", "#3b82f6", "#a855f7"];
  const currentColor = editor.getAttributes("textStyle").color || "#000000";

  // Atualiza o estado local quando a cor do editor mudar externamente
  useEffect(() => {
    // 1. Cor
    setTempColor(currentColor);

    // 2. Tamanho da Fonte
    const sizeStr = editor.getAttributes("textStyle").fontSize;
    if (sizeStr) {
      setFontSize(parseInt(sizeStr.replace("px", ""), 10));
    } else {
      setFontSize(16); // Default
    }
  }, [editor.state.selection, isSizeOpen, isColorOpen, currentColor]); // Dependências cruciais
  const closeAllMenus = () => {
    setIsTypeOpen(false);
    setIsColorOpen(false);
    setIsSizeOpen(false);
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const getCurrentFontSize = () => {
    const sizeStr = editor.getAttributes("textStyle").fontSize;
    // Se não tiver size, assume 16 (padrão web)
    return sizeStr ? parseInt(sizeStr.replace("px", ""), 10) : 16;
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "top",
        onHide: () => {
          setIsTypeOpen(false);
          setIsColorOpen(false);
        },
      }}
      appendTo={() => document.body}
      shouldShow={({ editor, from, to }) => {
        // Só mostra se tiver seleção e não for imagem
        return from !== to && !editor.isActive("image");
      }}
      // --- CORREÇÃO AQUI: overflow-visible ---
      className="flex items-center gap-1 p-1 rounded-lg bg-white shadow-xl border border-gray-200 overflow-visible z-50"
    >
      {/* Dropdown de Tipo */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            // Fecha a cor se abrir o tipo
            setIsColorOpen(false);
            setIsTypeOpen(!isTypeOpen);
          }}
          className="flex items-center gap-1 p-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer min-w-[40px] justify-center"
        >
          <Type size={16} />
          <ChevronDown size={12} />
        </button>

        {isTypeOpen && (
          // Adicionei z-50 e bg-white para garantir visibilidade
          <div className="absolute top-full left-0 mt-1 w-32 bg-white shadow-lg rounded border border-gray-100 flex flex-col z-50 overflow-hidden">
            <button
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setIsTypeOpen(false);
              }}
              className="text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700"
            >
              Parágrafo
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setIsTypeOpen(false);
              }}
              className="text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700"
            >
              Título 1
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setIsTypeOpen(false);
              }}
              className="text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700"
            >
              Título 2
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleBulletList().run();
                setIsTypeOpen(false);
              }}
              className="text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700"
            >
              Lista
            </button>
          </div>
        )}
      </div>

      {/* 2. TAMANHO DA FONTE (Corrigido) */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            closeAllMenus();
            setIsSizeOpen(!isSizeOpen);
          }}
          className="p-1.5 rounded cursor-pointer text-gray-600 hover:bg-gray-100 flex items-center gap-1 min-w-[45px]"
          title="Tamanho da fonte"
        >
          <Scaling size={16} />
          {/* Mostra o estado local (fluido) */}
          <span className="text-[10px] text-center w-4 font-medium">
            {fontSize}
          </span>
        </button>

        {isSizeOpen && (
          <div className="absolute top-full left-0 mt-1 p-3 bg-white shadow-lg rounded border border-gray-100 flex flex-col gap-2 z-50 w-48">
            <div className="flex justify-between text-xs text-gray-500">
              {/* Mostra o estado local */}
              <span>Tamanho: {fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="48"
              step="1"
              // Value ligado ao estado local
              value={fontSize}
              // onChange atualiza visualmente NA HORA e aplica no Tiptap
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFontSize(val); // Atualiza UI instantaneamente
                editor.chain().focus().setFontSize(`${val}px`).run(); // Atualiza Editor
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 px-1">
              <span>A-</span>
              <span>A+</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      {/* Botões de Formatação (Mantidos igual) */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded cursor-pointer ${
          editor.isActive("bold")
            ? "bg-gray-100 text-black"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded cursor-pointer ${
          editor.isActive("italic")
            ? "bg-gray-100 text-black"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded cursor-pointer ${
          editor.isActive("underline")
            ? "bg-gray-100 text-black"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded cursor-pointer ${
          editor.isActive("strike")
            ? "bg-gray-100 text-black"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Strikethrough size={16} />
      </button>
      <button
        onClick={setLink}
        className={`p-1.5 rounded cursor-pointer ${
          editor.isActive("link")
            ? "bg-blue-100 text-blue-600"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <LinkIcon size={16} />
      </button>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      {/* 4. COR (Color Picker Real + Presets) */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            closeAllMenus();
            setIsColorOpen(!isColorOpen);
          }}
          className="p-1.5 rounded cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center gap-1"
        >
          <Palette
            size={16}
            style={{ color: editor.getAttributes("textStyle").color }}
          />
        </button>
        {isColorOpen && (
          <div className="absolute top-full right-0 mt-1 p-3 bg-white shadow-lg rounded border border-gray-100 flex flex-col gap-3 z-50 w-max">
            {/* INPUT COLOR NATIVO */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-semibold uppercase">
                Personalizada
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                  <input
                    type="color"
                    value={tempColor}
                    // onInput atualiza enquanto arrasta
                    onInput={(e) => {
                      const val = (e.target as HTMLInputElement).value;
                      setTempColor(val);
                      editor.chain().focus().setColor(val).run();
                    }}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                  />
                </div>
                <span className="text-xs text-gray-600">
                  {editor.getAttributes("textStyle").color || "#000000"}
                </span>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* PRESETS */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-semibold uppercase">
                Sugestões
              </label>
              <div className="flex gap-1.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setTempColor(color); // Atualiza estado local
                      editor.chain().focus().setColor(color).run();
                    }}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                      currentColor === color
                        ? "ring-2 ring-blue-400 ring-offset-1"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <button
                  onClick={() => {
                    setTempColor("#000000");
                    editor.chain().focus().unsetColor().run();
                  }}
                  className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-[10px] hover:bg-gray-100 text-gray-500"
                  title="Remover cor"
                >
                  X
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {editor.isActive("image") ? (
        // MENU ESPECÍFICO PARA IMAGEM
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .setImage({
                  src: editor.getAttributes("image").src,
                  alt: "left",
                })
                .run()
            }
            className="p-1.5 hover:bg-gray-100 rounded"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .setImage({
                  src: editor.getAttributes("image").src,
                  alt: "center",
                })
                .run()
            }
            className="p-1.5 hover:bg-gray-100 rounded"
          >
            <AlignCenter size={16} />
          </button>
          {/* Adicione lógica de CSS para float/margin based on 'alt' ou attributes customizados */}
        </div>
      ) : (
        // O MENU DE TEXTO NORMAL QUE JÁ CRIAMOS
        <> ... </>
      )}
    </BubbleMenu>
  );
};
