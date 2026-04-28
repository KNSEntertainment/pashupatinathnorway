"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent, Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

// ✅ Props type
interface EditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
	const isSettingContent = useRef(false);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-brand underline",
				},
			}),
			Image,
			Underline,
			Placeholder.configure({
				placeholder: placeholder || "Start writing...",
			}),
		],
		content: value || "",
		onUpdate: ({ editor }) => {
			if (isSettingContent.current) return;
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none w-full p-2 min-h-[200px]",
			},
		},
	});

	// Sync external value safely
	useEffect(() => {
		if (!editor) return;

		const current = editor.getHTML();
		if (value !== current) {
			isSettingContent.current = true;
			editor.commands.setContent(value || "", false);
			isSettingContent.current = false;
		}
	}, [value, editor]);

	// Cleanup
	useEffect(() => {
		return () => {
			editor?.destroy();
		};
	}, [editor]);

	if (!editor) {
		return <div className="p-2 text-gray-400">Loading editor...</div>;
	}

	return (
		<div className="border rounded overflow-hidden">
			<Toolbar editor={editor} />
			<EditorContent editor={editor} className="border-t" />
		</div>
	);
}

// ✅ Toolbar typing
function Toolbar({ editor }: { editor: TiptapEditor }) {
	return (
		<div className="border-b p-2 flex flex-wrap gap-1 bg-light">
			<button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
				B
			</button>
			<button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
				I
			</button>
			<button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>
				U
			</button>
			<button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
				H2
			</button>
			<button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
				•
			</button>
			<button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
				1.
			</button>
			<button
				type="button"
				onClick={() => {
					const url = window.prompt("Enter URL");
					if (url) editor.chain().focus().setLink({ href: url }).run();
				}}
			>
				🔗
			</button>
			<button type="button" onClick={() => editor.chain().focus().undo().run()}>
				↺
			</button>
			<button type="button" onClick={() => editor.chain().focus().redo().run()}>
				↻
			</button>
		</div>
	);
}
