import React from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Braces } from "lucide-react";

const VariableComponent: React.FC<NodeViewProps> = (props) => {
  const { node, selected } = props;
  const { label } = node.attrs;

  return (
    <NodeViewWrapper className="inline-flex mx-1 align-baseline">
      <span
        className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium select-none transition-all
          ${
            selected
              ? "bg-blue-200 text-blue-900 ring-2 ring-blue-400 cursor-default" // Estilo quando selecionado
              : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 cursor-pointer" // Estilo padrão
          }
        `}
        contentEditable={false} // Garante que o usuário não digite DENTRO da tag
        data-variable-id={node.attrs.id}
      >
        <Braces size={10} className="opacity-50" />
        {label}
      </span>
    </NodeViewWrapper>
  );
};

export default VariableComponent;
