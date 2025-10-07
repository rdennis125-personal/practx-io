"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ items, defaultTab, onChange, className }: TabsProps) {
  const tabIds = useMemo(() => items.map((item) => item.id), [items]);
  const initial = defaultTab && tabIds.includes(defaultTab) ? defaultTab : tabIds[0];
  const [active, setActive] = useState(initial);

  useEffect(() => {
    if (defaultTab && tabIds.includes(defaultTab)) {
      setActive(defaultTab);
    }
  }, [defaultTab, tabIds]);

  useEffect(() => {
    onChange?.(active);
  }, [active, onChange]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();
    const currentIndex = tabIds.indexOf(active);
    if (currentIndex === -1) {
      return;
    }

    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + delta + tabIds.length) % tabIds.length;
    setActive(tabIds[nextIndex]);

    const trigger = document.querySelector<HTMLButtonElement>(`#${tabIds[nextIndex]}-trigger`);
    trigger?.focus();
  };

  return (
    <div className={cn("tabs", className)}>
      <div className="tabs__list" role="tablist" aria-orientation="horizontal" onKeyDown={handleKeyDown}>
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              id={`${item.id}-trigger`}
              role="tab"
              type="button"
              className="tabs__trigger"
              aria-selected={isActive}
              aria-controls={`${item.id}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <div
            key={item.id}
            id={`${item.id}-panel`}
            role="tabpanel"
            tabIndex={0}
            className="tabs__panel"
            hidden={!isActive}
            aria-labelledby={`${item.id}-trigger`}
          >
            {isActive ? item.content : null}
          </div>
        );
      })}
    </div>
  );
}
