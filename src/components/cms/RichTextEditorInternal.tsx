import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Sparkles
} from "lucide-react";

interface RichTextEditorInternalProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditorInternal({
  content,
  onChange,
}: RichTextEditorInternalProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent-gold underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-h-[400px] object-cover my-4 mx-auto",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4 border border-primary-sage/35",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-primary-sage/35 bg-secondary-cream font-semibold p-2 text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-primary-sage/35 p-2 text-left",
        },
      }),
    ],
    content: content || "<p>Begin writing your sacred wisdom...</p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose max-w-none focus:outline-none min-h-[300px] p-6 text-foreground bg-[#FCFCFA]",
      },
    },
  });

  // Sync external content changes (e.g. on load or reset)
  useEffect(() => {
    if (editor && content !== editor.getHTML() && content !== "") {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Enter link URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled = false,
    title,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-colors focus:outline-none ${
        isActive
          ? "bg-primary-forest text-[#FCFCFA]"
          : "text-foreground/80 hover:bg-primary-sage/10 hover:text-primary-forest"
      } ${disabled ? "opacity-35 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-primary-sage/20 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-secondary-cream border-b border-primary-sage/20 items-center justify-between">
        <div className="flex flex-wrap gap-1 items-center">
          {/* History */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={15} />
          </ToolbarButton>

          <div className="w-[1px] h-5 bg-primary-sage/20 mx-1" />

          {/* Typography Styles */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={15} />
          </ToolbarButton>

          <div className="w-[1px] h-5 bg-primary-sage/20 mx-1" />

          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon size={15} />
          </ToolbarButton>

          <div className="w-[1px] h-5 bg-primary-sage/20 mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered size={15} />
          </ToolbarButton>

          <div className="w-[1px] h-5 bg-primary-sage/20 mx-1" />

          {/* Rich Content elements */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <Code size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Insert Link">
            <LinkIcon size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title="Insert Image Link">
            <ImageIcon size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={addTable} title="Insert Table">
            <TableIcon size={15} />
          </ToolbarButton>
        </div>

        <span className="text-[10px] uppercase font-bold text-accent-gold flex items-center gap-1">
          <Sparkles size={11} /> Rich Text Active
        </span>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} className="min-h-[300px] max-h-[500px] overflow-y-auto" />
    </div>
  );
}
