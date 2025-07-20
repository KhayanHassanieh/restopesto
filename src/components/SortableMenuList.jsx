'use client';
import { useEffect, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, render }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {render({ attributes, listeners })}
    </div>
  );
}

export default function SortableMenuList({ items, renderItem, onReorder }) {
  const [ordered, setOrdered] = useState(items);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setOrdered(items);
  }, [items]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ordered.findIndex((i) => i.id === active.id);
      const newIndex = ordered.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(ordered, oldIndex, newIndex);
      setOrdered(newOrder);
      onReorder && onReorder(newOrder);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {ordered.map((item) => (
          <SortableItem
            key={item.id}
            id={item.id}
            render={(handleProps) => renderItem(item, handleProps)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
