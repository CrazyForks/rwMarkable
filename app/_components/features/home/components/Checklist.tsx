"use client";

import { useState, useEffect } from "react";
import { ChecklistItem } from "./ChecklistItem";
import { ShareModal } from "@/app/_components/ui/modals/sharing/ShareModal";
import {
  deleteListAction,
  createItemAction,
  updateItemAction,
  deleteItemAction,
  reorderItemsAction,
} from "@/app/_server/actions/data/actions";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Checklist } from "@/app/_types";
import { ChecklistHeader } from "./ChecklistHeader";
import { ChecklistProgress } from "./ChecklistProgress";
import { ChecklistForm } from "./ChecklistForm";

interface ChecklistViewProps {
  list: Checklist;
  onUpdate: () => void;
  onBack: () => void;
  onEdit?: (checklist: Checklist) => void;
  onDelete?: (deletedId: string) => void;
}

export function ChecklistView({
  list,
  onUpdate,
  onBack,
  onEdit,
  onDelete,
}: ChecklistViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [localList, setLocalList] = useState(list);

  useEffect(() => {
    setLocalList(list);
  }, [list]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDeleteList = async () => {
    if (confirm("Are you sure you want to delete this checklist?")) {
      const formData = new FormData();
      formData.append("id", localList.id);
      formData.append("category", localList.category || "Uncategorized");
      await deleteListAction(formData);
      onDelete?.(localList.id);
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    const formData = new FormData();
    formData.append("listId", localList.id);
    formData.append("itemId", itemId);
    formData.append("completed", String(completed));
    const result = await updateItemAction(formData);

    if (result.success) {
      setLocalList((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, completed } : item
        ),
      }));
    }
    onUpdate();
  };

  const handleDeleteItem = async (itemId: string) => {
    const formData = new FormData();
    formData.append("listId", localList.id);
    formData.append("itemId", itemId);
    const result = await deleteItemAction(formData);

    if (result.success) {
      setLocalList((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));
    }
    onUpdate();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const incompleteItems = localList.items.filter((item) => !item.completed);
      const completedItems = localList.items.filter((item) => item.completed);

      const incompleteOldIndex = incompleteItems.findIndex(
        (item) => item.id === active.id
      );
      const incompleteNewIndex = incompleteItems.findIndex(
        (item) => item.id === over?.id
      );

      if (incompleteOldIndex !== -1 && incompleteNewIndex !== -1) {
        const newIncompleteItems = arrayMove(
          incompleteItems,
          incompleteOldIndex,
          incompleteNewIndex
        ).map((item, index) => ({ ...item, order: index }));
        const newItems = [...newIncompleteItems, ...completedItems].map(
          (item, index) => ({ ...item, order: index })
        );

        setLocalList((prev) => ({
          ...prev,
          items: newItems,
        }));

        const itemIds = newItems.map((item) => item.id);

        const formData = new FormData();
        formData.append("listId", localList.id);
        formData.append("itemIds", JSON.stringify(itemIds));
        formData.append("currentItems", JSON.stringify(newItems));
        const result = await reorderItemsAction(formData);

        if (!result.success) {
          setLocalList((prev) => ({
            ...prev,
            items: list.items,
          }));
        }
        onUpdate();
        return;
      }

      const completedOldIndex = completedItems.findIndex(
        (item) => item.id === active.id
      );
      const completedNewIndex = completedItems.findIndex(
        (item) => item.id === over?.id
      );

      if (completedOldIndex !== -1 && completedNewIndex !== -1) {
        const newCompletedItems = arrayMove(
          completedItems,
          completedOldIndex,
          completedNewIndex
        ).map((item, index) => ({ ...item, order: index }));
        const newItems = [...incompleteItems, ...newCompletedItems].map(
          (item, index) => ({ ...item, order: index })
        );

        setLocalList((prev) => ({
          ...prev,
          items: newItems,
        }));

        const itemIds = newItems.map((item) => item.id);

        const formData = new FormData();
        formData.append("listId", localList.id);
        formData.append("itemIds", JSON.stringify(itemIds));
        formData.append("currentItems", JSON.stringify(newItems));
        const result = await reorderItemsAction(formData);

        if (!result.success) {
          setLocalList((prev) => ({
            ...prev,
            items: list.items,
          }));
        }
        onUpdate();
      }
    }
  };

  const incompleteItems = localList.items.filter((item) => !item.completed);
  const completedItems = localList.items.filter((item) => item.completed);
  const totalCount = localList.items.length;

  return (
    <div className="h-full flex flex-col bg-background">
      <ChecklistHeader
        checklist={localList}
        onBack={onBack}
        onEdit={() => onEdit?.(list)}
        onDelete={handleDeleteList}
        onShare={() => setShowShareModal(true)}
      />

      {totalCount > 0 && <ChecklistProgress checklist={localList} />}

      <div className="flex-1 overflow-y-auto p-3 lg:p-6 bg-background-secondary">
        <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 pb-20 lg:pb-0">
          <div className="bg-background rounded-lg border border-border p-4">
            <ChecklistForm
              onSubmit={async (text) => {
                setIsLoading(true);
                const formData = new FormData();
                formData.append("listId", localList.id);
                formData.append("text", text);
                const result = await createItemAction(formData);
                setIsLoading(false);

                if (result.success && result.data) {
                  setLocalList((prev) => ({
                    ...prev,
                    items: [...prev.items, result.data],
                  }));
                }
                onUpdate();
              }}
              isLoading={isLoading}
            />
          </div>

          {incompleteItems.length > 0 && (
            <div className="bg-background rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                To Do ({incompleteItems.length})
                {isLoading && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    Saving...
                  </span>
                )}
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={incompleteItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {incompleteItems.map((item) => (
                      <ChecklistItem
                        key={item.id}
                        item={item}
                        onToggle={handleToggleItem}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {completedItems.length > 0 && (
            <div className="bg-background rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Completed ({completedItems.length})
                {isLoading && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    Saving...
                  </span>
                )}
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={completedItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {completedItems.map((item) => (
                      <ChecklistItem
                        key={item.id}
                        item={item}
                        onToggle={handleToggleItem}
                        onDelete={handleDeleteItem}
                        completed
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {localList.items.length === 0 && (
            <div className="bg-background rounded-lg border border-border p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No items yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Add your first item to get started with this checklist.
              </p>
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          itemId={localList.id}
          itemTitle={localList.title}
          itemType="checklist"
          itemCategory={localList.category}
          itemOwner={localList.owner || ""}
        />
      )}
    </div>
  );
}
