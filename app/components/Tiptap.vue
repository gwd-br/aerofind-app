<template>
    <div
        v-if="editor"
        class="container border-gray-500 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
    >
        {{ props.modelValue }}sadsa
        <div class="border border-1 border-gray-300 rounded-lg p-2 mb-2">
            <editor-content :editor="editor" />
        </div>

        <div class="control-group">
            <div class="span-group">
                <span
                    class="rounded-md cursor-pointer bg-gray-200 px-2 py-1 text-sm m-1"
                    @click="insertTable"
                >
                    Inserir Tabela
                </span>

                <span
                    class="rounded-md cursor-pointer bg-gray-200 px-2 py-1 text-sm m-1"
                    @click="addColumnBefore"
                    :disabled="!canAddColumnBefore()"
                >
                    Adicionar coluna antes
                </span>
                <span
                    class="rounded-md cursor-pointer bg-gray-200 px-2 py-1 text-sm m-1"
                    @click="addColumnAfter"
                    :disabled="!canAddColumnAfter()"
                >
                    Adicionar coluna depois
                </span>
                <span
                    class="rounded-md cursor-pointer bg-gray-200 px-2 py-1 text-sm m-1"
                    @click="deleteColumn"
                    :disabled="!canDeleteColumn()"
                >
                    Deletar coluna
                </span>
                <span
                    class="rounded-md cursor-pointer bg-gray-200 px-2 py-1 text-sm m-1"
                    @click="addRowBefore"
                    :disabled="!canAddRowBefore()"
                >
                    Adicionar linha antes
                </span>
                <span
                    class="rounded-md cursor-pointer bg-gray-200 px-2 py-1 text-sm m-1"
                    @click="addRowAfter"
                    :disabled="!canAddRowAfter()"
                >
                    Adicionar linha depois
                </span>
                <span
                    class="rounded-md cursor-pointer bg-gray-200 px-2 py-1 text-sm m-1"
                    @click="deleteRow"
                    :disabled="!canDeleteRow()"
                >
                    Deletar linha
                </span>
                <span
                    class="rounded-md cursor-pointer bg-gray-200 px-2 py-1 text-sm m-1"
                    @click="deleteTable"
                    :disabled="!canDeleteTable()"
                >
                    Deletar tabela
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

// const campo = defineModel({
//     type: String,
//     required: true,
// });
const props = defineProps({
    modelValue: {
        type: String,
        default: "",
    },
});

// Customização da célula da tabela para adicionar atributos
const CustomTableCell = TableCell.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            backgroundColor: {
                default: null,
                parseHTML: (element) =>
                    element.getAttribute("data-background-color"),
                renderHTML: (attributes) => {
                    return {
                        "data-background-color": attributes.backgroundColor,
                        style: `background-color: ${attributes.backgroundColor}`,
                    };
                },
            },
        };
    },
});

const editor = useEditor({
    extensions: [
        StarterKit,
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader.configure({ colwidth: "50px" }),
        CustomTableCell,
    ],
    content: props.modelValue,
});
const tableHTML = `
    <table width="100%">
      <tr>
        <th>col 1</th>
        <th>col 2</th>
        <th>col 3</th>
        <th>col 4</th>
        <th>col 5</th>
      </tr>
      <tr>
        <td>row 1</td>
        <td>---</td>
        <td>---</td>
        <td>---</td>
        <td>---</td>
      </tr>
      <tr>
        <td>row 1</td>
        <td>---</td>
        <td>---</td>
        <td>---</td>
        <td>---</td>
      </tr>
      <tr>
        <td>row 1</td>
        <td>---</td>
        <td>---</td>
        <td>---</td>
        <td>---</td>
      </tr>
    </table>`;

// Funções para inserir e manipular tabelas
const insertTable = () =>
    editor.value
        .chain()
        .focus()
        .insertTable({ rows: 4, cols: 5, withHeaderRow: true })
        .run();
const insertHTMLTable = () =>
    editor.value
        .chain()
        .focus()
        .insertContent(tableHTML, {
            parseOptions: { preserveWhitespace: false },
        })
        .run();

// Funções de verificação de permissões
const canAddColumnBefore = () => editor.value?.can().addColumnBefore();
const canAddColumnAfter = () => editor.value?.can().addColumnAfter();
const canDeleteColumn = () => editor.value?.can().deleteColumn();
const canAddRowBefore = () => editor.value?.can().addRowBefore();
const canAddRowAfter = () => editor.value?.can().addRowAfter();
const canDeleteRow = () => editor.value?.can().deleteRow();
const canDeleteTable = () => editor.value?.can().deleteTable();
const canMergeCells = () => editor.value?.can().mergeCells();
const canSplitCell = () => editor.value?.can().splitCell();
const canToggleHeaderColumn = () => editor.value?.can().toggleHeaderColumn();
const canToggleHeaderRow = () => editor.value?.can().toggleHeaderRow();
const canToggleHeaderCell = () => editor.value?.can().toggleHeaderCell();
const canMergeOrSplit = () => editor.value?.can().mergeOrSplit();
const canSetCellAttribute = () =>
    editor.value?.can().setCellAttribute("backgroundColor", "#FAF594");
const canFixTables = () => editor.value?.can().fixTables();
const canGoToNextCell = () => editor.value?.can().goToNextCell();
const canGoToPreviousCell = () => editor.value?.can().goToPreviousCell();

// Funções para manipulação de tabelas
const addColumnBefore = () =>
    editor.value.chain().focus().addColumnBefore().run();
const addColumnAfter = () =>
    editor.value.chain().focus().addColumnAfter().run();
const deleteColumn = () => editor.value.chain().focus().deleteColumn().run();
const addRowBefore = () => editor.value.chain().focus().addRowBefore().run();
const addRowAfter = () => editor.value.chain().focus().addRowAfter().run();
const deleteRow = () => editor.value.chain().focus().deleteRow().run();
const deleteTable = () => editor.value.chain().focus().deleteTable().run();
const mergeCells = () => editor.value.chain().focus().mergeCells().run();
const splitCell = () => editor.value.chain().focus().splitCell().run();
const toggleHeaderColumn = () =>
    editor.value.chain().focus().toggleHeaderColumn().run();
const toggleHeaderRow = () =>
    editor.value.chain().focus().toggleHeaderRow().run();
const toggleHeaderCell = () =>
    editor.value.chain().focus().toggleHeaderCell().run();
const mergeOrSplit = () => editor.value.chain().focus().mergeOrSplit().run();
const setCellAttribute = () =>
    editor.value
        .chain()
        .focus()
        .setCellAttribute("backgroundColor", "#FAF594")
        .run();
const fixTables = () => editor.value.chain().focus().fixTables().run();
const goToNextCell = () => editor.value.chain().focus().goToNextCell().run();
const goToPreviousCell = () =>
    editor.value.chain().focus().goToPreviousCell().run();

const emit = defineEmits(["update:modelValue"]);

import { watch } from "vue";

watch(
    () => editor?.content,
    (newContent) => {
        emit("update:modelValue", newContent);
    }
);
</script>

<style scoped>
/* Basic editor styles */
.tiptap {
    :first-child {
        margin-top: 0;
    }

    /* List styles */
    ul,
    ol {
        padding: 0 1rem;
        margin: 1.25rem 1rem 1.25rem 0.4rem;

        li p {
            margin-top: 0.25em;
            margin-bottom: 0.25em;
        }
    }

    /* Heading styles */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        line-height: 1.1;
        margin-top: 2.5rem;
        text-wrap: pretty;
    }

    h1,
    h2 {
        margin-top: 3.5rem;
        margin-bottom: 1.5rem;
    }

    h1 {
        font-size: 1.4rem;
    }

    h2 {
        font-size: 1.2rem;
    }

    h3 {
        font-size: 1.1rem;
    }

    h4,
    h5,
    h6 {
        font-size: 1rem;
    }

    /* Code and preformatted text styles */
    code {
        background-color: var(--purple-light);
        border-radius: 0.4rem;
        color: var(--black);
        font-size: 0.85rem;
        padding: 0.25em 0.3em;
    }

    pre {
        background: var(--black);
        border-radius: 0.5rem;
        color: var(--white);
        font-family: "JetBrainsMono", monospace;
        margin: 1.5rem 0;
        padding: 0.75rem 1rem;

        code {
            background: none;
            color: inherit;
            font-size: 0.8rem;
            padding: 0;
        }
    }

    blockquote {
        border-left: 3px solid var(--gray-3);
        margin: 1.5rem 0;
        padding-left: 1rem;
    }

    hr {
        border: none;
        border-top: 1px solid var(--gray-2);
        margin: 2rem 0;
    }

    /* Table-specific styling */
    table {
        border-collapse: collapse;
        margin: 0;
        overflow: hidden;
        table-layout: fixed;
        width: 100%;

        td,
        th {
            border: 1px solid var(black);
            box-sizing: border-box;
            min-width: 1em;
            padding: 6px 8px;
            position: relative;
            vertical-align: top;

            > * {
                margin-bottom: 0;
            }
        }

        th {
            background-color: var(--gray-1);
            font-weight: bold;
            text-align: left;
        }

        .selectedCell:after {
            background: var(--gray-2);
            content: "";
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 2;
        }

        .column-resize-handle {
            background-color: var(--purple);
            bottom: -2px;
            pointer-events: none;
            position: absolute;
            right: -2px;
            top: 0;
            width: 4px;
        }
    }

    .tableWrapper {
        margin: 1.5rem 0;
        overflow-x: auto;
    }

    &.resize-cursor {
        cursor: ew-resize;
        cursor: col-resize;
    }
}
</style>
