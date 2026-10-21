"use client";

import { useState } from "react";
import {
  CATEGORIES,
  DEFAULT_PRIORITY,
  PRIORITIES,
  type Category,
  type Priority,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TodoInputProps {
  onAdd: (
    text: string,
    priority: Priority,
    dueDate?: string,
    category?: Category
  ) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState("");
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<Category | undefined>(undefined);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // 빈/공백 입력이면 추가하지 않고 선택값(우선순위·마감일·카테고리)도 유지한다.
    if (!value.trim()) return;
    onAdd(value, priority, dueDate || undefined, category);
    setValue("");
    setPriority(DEFAULT_PRIORITY);
    setDueDate("");
    setCategory(undefined);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>TO-DO 추가</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="할 일을 입력하고 Enter를 누르세요"
            aria-label="새 할 일"
          />

          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="마감일"
            className="w-auto"
          />

          <div role="radiogroup" aria-label="우선순위" className="flex gap-1">
            {PRIORITIES.map((item) => {
              const selected = item.value === priority;
              return (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={selected ? "default" : "outline"}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPriority(item.value)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>

          <div role="radiogroup" aria-label="카테고리" className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={category === undefined ? "default" : "outline"}
              role="radio"
              aria-checked={category === undefined}
              onClick={() => setCategory(undefined)}
            >
              없음
            </Button>
            {CATEGORIES.map((item) => {
              const selected = item.value === category;
              return (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={selected ? "default" : "outline"}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setCategory(item.value)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            추가
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
