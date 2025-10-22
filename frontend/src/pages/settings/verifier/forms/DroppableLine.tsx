import { useDroppable } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { SortableField } from "./SortableField"; // 🆕 nouveau composant sortable
import { t } from "i18next";

export function DroppableLine({ line }: any) {
    const { setNodeRef, isOver } = useDroppable({ id: line.id });

    const fieldWidth =
        line.fields.length === 1
            ? "w-full"
            : line.fields.length === 2
                ? "w-1/2"
                : "w-1/3";

    const border = isOver ? "border-transparent" : "border-(--border-secondary)";

    return (
        <SortableContext
            id={ line.id }
            items={ line.fields.map((f: any) => f.id) }
            strategy={ horizontalListSortingStrategy }
        >
            <div ref={ setNodeRef } className="DroppableLine flex gap-4 p-2 flex-wrap relative">
                { line.fields.length ? (
                    line.fields.map((f: any) => (
                        <div key={ f.id } className={ `${ fieldWidth } flex-1 min-w-[30%]` }>
                            <SortableField field={ f }/>
                        </div>
                    ))
                ) : (
                    <span className={ `border-2 ${ border } w-full rounded-md p-2 text-(--text-secondary) text-sm` }>
                        { t("VERIFIER.drop_create_new_line") }
                    </span>
                ) }
            </div>
        </SortableContext>
    );
}
