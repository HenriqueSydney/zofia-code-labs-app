import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  ChevronDown,
  Type,
  Variable,
  List,
  ListOrdered,
  Palette,
  Table as TableIcon,
  Plus,
  Trash2,
  Columns,
  Rows,
  Type as FontSizeIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToolbarButton } from "./ToolbarButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  editor: Editor | null;
  variables: { id: string; label: string }[];
}

export const Toolbar = ({ editor, variables }: ToolbarProps) => {
  if (!editor) return null;

  const currentColor = editor.getAttributes("textStyle").color || "#000000";
  const currentFontSize =
    editor.getAttributes("textStyle").fontSize?.replace("px", "") || "16";

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-t-md border-x border-t bg-background shadow-sm">
        {/* 1. ESTILO DE TEXTO (H1, H2, P) */}
        <Select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
              ? "h2"
              : "p"
          }
          onValueChange={(value) => {
            if (value === "p") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: parseInt(value.replace("h", "")) as any,
                })
                .run();
          }}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs font-medium border-none hover:bg-muted transition-colors">
            <SelectValue placeholder="Estilo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Texto Normal</SelectItem>
            <SelectItem value="h1" className="font-bold">
              Título 1
            </SelectItem>
            <SelectItem value="h2" className="font-semibold">
              Título 2
            </SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 2. TAMANHO DA FONTE & COR */}
        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 flex items-center gap-1 text-xs"
              >
                <span className="w-4 font-mono">{currentFontSize}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-16">
              {["12", "14", "16", "18", "20", "24", "32"].map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() =>
                    editor.chain().focus().setFontSize(`${size}px`).run()
                  }
                >
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white"
                title="Cor do texto"
              >
                <Palette className="h-4 w-4 " style={{ color: currentColor }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 grid grid-cols-5 gap-2 space-y-2">
              {["#000000", "#ef4444", "#3b82f6", "#22c55e", "#a855f7"].map(
                (color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border border-muted cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                )
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="col-span-5 h-7 text-[10px]"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                Limpar Cor
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 3. FORMATAÇÃO BÁSICA */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            description="Negrito"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            description="Sublinhado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 4. ALINHAMENTO */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-12 flex items-center justify-between px-1"
            >
              <AlignLeft className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-4 w-4 mr-2" /> Esquerda
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenter className="h-4 w-4 mr-2" /> Centro
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
            >
              <AlignJustify className="h-4 w-4 mr-2" /> Justificar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 5. TABELAS (O Queridinho dos Contratos) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={editor.isActive("table") ? "secondary" : "ghost"}
              size="sm"
              className="h-8 flex items-center gap-1"
            >
              <TableIcon className="h-4 w-4" />
              <span className="text-xs font-normal">Tabela</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 text-xs">
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              <Plus className="h-4 w-4 mr-2" /> Inserir Tabela 3x3
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.isActive("table")}
            >
              <Columns className="h-4 w-4 mr-2" /> Adicionar Coluna
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.isActive("table")}
            >
              <Rows className="h-4 w-4 mr-2" /> Adicionar Linha
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.isActive("table")}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Excluir Tabela
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 6. VARIÁVEIS */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-dashed border-primary/50 flex items-center gap-2"
            >
              <Variable className="h-3.5 w-3.5" />
              <span className="text-xs">Campos</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-60 overflow-y-auto">
            {variables.map((v) => (
              <DropdownMenuItem
                key={v.id}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      type: "variable",
                      attrs: { id: v.id, label: v.label },
                    })
                    .run()
                }
              >
                <span className="bg-primary/10 px-1 rounded text-[10px] mr-2">
                  {v.id}
                </span>{" "}
                {v.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-grow" />

        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            description="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            description="Refazer"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>
    </TooltipProvider>
  );
};
