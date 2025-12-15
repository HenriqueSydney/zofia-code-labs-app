import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Heading1,
  Heading2,
  List,
  Table,
  Braces,
  LucideIcon,
  Heading3,
  Quote,
  MessageSquare,
  Minus,
  LayoutTemplate,
} from "lucide-react";
import { Editor, Range } from "@tiptap/core";

// 1. Mapeamento de ícones
const icons = {
  H1: Heading1,
  H2: Heading2,
  H3: Heading3,
  List: List,
  Table: Table,
  Variable: Braces,
  Quote: Quote,
  Callout: MessageSquare,
  Divider: Minus,
  HeaderLayout: LayoutTemplate,
};

// 2. Interface para um item individual do menu
export interface CommandItem {
  title: string;
  // Garante que o ícone seja uma das chaves do objeto icons (ex: 'H1' | 'List')
  icon: keyof typeof icons;
  command: (props: { editor: Editor; range: Range }) => void;
}

// 3. Interface para as Props do componente
interface CommandListProps {
  items: CommandItem[];
  editor: Editor;
  range: Range;
}

// 4. Interface para o método exposto via Ref (usado pelo suggestion.ts)
export interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListRef, CommandListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        item.command({ editor: props.editor, range: props.range });
      }
    };

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length
          );
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % props.items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    return (
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-72 p-1">
        {props.items.length ? (
          props.items.map((item, index) => {
            // Fallback seguro: se o ícone não existir no mapa, usa Braces
            const IconComponent: LucideIcon = icons[item.icon] || Braces;

            return (
              <button
                key={index}
                className={`flex items-center w-full px-2 py-2 text-sm text-left rounded-md transition-colors ${
                  index === selectedIndex
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => selectItem(index)}
                // type="button" previne submeter formulários acidentalmente se estiver dentro de um
                type="button"
              >
                <div className="border border-gray-200 bg-white rounded p-1 mr-3">
                  <IconComponent size={16} />
                </div>
                <span className="font-medium">{item.title}</span>
              </button>
            );
          })
        ) : (
          <div className="px-2 py-2 text-gray-400 text-sm">Sem resultados</div>
        )}
      </div>
    );
  }
);

// É boa prática definir o displayName para componentes forwardRef
CommandList.displayName = "CommandList";

export default CommandList;
