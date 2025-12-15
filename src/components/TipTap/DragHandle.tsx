import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { GripVertical, Plus } from "lucide-react";

interface DragHandleProps {
  editor: Editor;
}

const DragHandle: React.FC<DragHandleProps> = ({ editor }) => {
  const [position, setPosition] = useState<number | null>(null);
  const [currentNodePos, setCurrentNodePos] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || !editor.view) return;

    const handleMouseMove = (e: MouseEvent) => {
      const view = editor.view;
      if (!view.dom) return;

      // 1. Identifica a posição do mouse relativa ao viewport
      // Usamos coordenadas X fixas dentro do editor para capturar blocos mesmo se o mouse estiver na calha
      const coords = {
        left: view.dom.getBoundingClientRect().left + 50, // Força a detecção dentro do texto
        top: e.clientY,
      };

      const pos = view.posAtCoords(coords);

      if (pos) {
        // Encontra o nó DOM correspondente
        let node = view.domAtPos(pos.pos).node as HTMLElement;
        if (node === view.dom) return; // Ignora se for o próprio editor

        // Sobe na árvore até achar o elemento de bloco direto (p, h1, div, etc)
        const blockElement = node.closest
          ? node.closest(".ProseMirror > *")
          : null;

        if (blockElement) {
          const rect = (blockElement as HTMLElement).getBoundingClientRect();
          const editorRect = view.dom.parentElement?.getBoundingClientRect(); // Pega o wrapper relativo

          if (!editorRect) return;

          // Calcula o TOP relativo ao wrapper pai (onde o componente DragHandle está montado)
          const relativeTop = rect.top - editorRect.top;

          // Só atualiza se mudou significativamente (evita tremedeira)
          if (Math.abs((position || 0) - relativeTop) > 2) {
            setPosition(relativeTop);
          }

          // Descobre a posição exata do nó para o Tiptap
          const nodePos = view.posAtDOM(blockElement as Node, 0);
          setCurrentNodePos(nodePos);
        }
      }
    };

    const parent = editor.view.dom.parentElement;
    if (parent) parent.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (parent) parent.removeEventListener("mousemove", handleMouseMove);
    };
  }, [editor, position]);

  const handleDragStart = (event: React.DragEvent) => {
    if (currentNodePos === null) return;

    // 1. Seleciona o nó no Tiptap
    editor.chain().setNodeSelection(currentNodePos).run();

    // 2. Configura o Drag Nativo
    const view = editor.view;
    const node = view.nodeDOM(currentNodePos) as HTMLElement;

    if (node) {
      // Truque: Cria uma imagem fantasma do texto para o usuário ver o que está arrastando
      event.dataTransfer.setDragImage(node, 0, 0);
      event.dataTransfer.effectAllowed = "move";
      // Define dados para compatibilidade
      event.dataTransfer.setData("text/html", node.outerHTML);
      event.dataTransfer.setData("text/plain", node.innerText);
    }
  };

  // Se a posição for nula ou negativa (fora da tela), esconde
  if (position === null || position < 0) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-1 z-50 flex items-center gap-1 transition-all duration-75" // left-1 posiciona na calha
      style={{ top: position }} // Segue a altura do bloco
    >
      {/* Botão de Adicionar (+) */}
      <button
        className="p-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        onClick={() =>
          editor
            .chain()
            .focus(currentNodePos!)
            .insertContentAt(currentNodePos! + 1, { type: "paragraph" })
            .run()
        }
        title="Adicionar bloco abaixo"
      >
        <Plus size={18} />
      </button>

      {/* Botão de Arrastar (::) */}
      <div
        draggable="true"
        onDragStart={handleDragStart}
        className="cursor-grab active:cursor-grabbing p-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="Arraste para mover"
      >
        <GripVertical size={18} />
      </div>
    </div>
  );
};

export default DragHandle;
