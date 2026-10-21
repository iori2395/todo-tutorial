import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Todo } from "@/lib/types";
import { TodoItem } from "@/components/todo-item";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "1",
    text: "테스트 할 일",
    completed: false,
    priority: "medium",
    createdAt: 0,
    ...overrides,
  };
}

describe("TodoItem", () => {
  it("할 일 텍스트를 렌더링한다", () => {
    render(
      <TodoItem
        todo={makeTodo()}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("테스트 할 일")).toBeInTheDocument();
  });

  it("체크박스를 클릭하면 해당 id로 onToggle을 호출한다", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoItem
        todo={makeTodo({ id: "abc" })}
        onToggle={onToggle}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledExactlyOnceWith("abc");
  });

  it("삭제 버튼을 클릭하면 해당 id로 onDelete를 호출한다", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoItem
        todo={makeTodo({ id: "abc" })}
        onToggle={vi.fn()}
        onDelete={onDelete}
        onEdit={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(onDelete).toHaveBeenCalledExactlyOnceWith("abc");
  });

  it("우선순위 라벨을 뱃지로 표시한다", () => {
    render(
      <TodoItem
        todo={makeTodo({ priority: "high" })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("높음")).toBeInTheDocument();
  });

  it("완료된 할 일은 취소선 스타일을 가진다", () => {
    render(
      <TodoItem
        todo={makeTodo({ completed: true })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("테스트 할 일")).toHaveClass("line-through");
  });

  it("마감일이 있으면 마감일을 표시한다", () => {
    render(
      <TodoItem
        todo={makeTodo({ dueDate: "2026-07-01" })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("2026-07-01")).toBeInTheDocument();
  });

  it("마감일이 없으면 마감일을 표시하지 않는다", () => {
    render(
      <TodoItem
        todo={makeTodo()}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.queryByText("2026-07-01")).not.toBeInTheDocument();
  });

  it("카테고리가 있으면 태그를 표시한다", () => {
    render(
      <TodoItem
        todo={makeTodo({ category: "work" })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("업무")).toBeInTheDocument();
  });

  it("카테고리가 없으면 태그를 표시하지 않는다", () => {
    render(
      <TodoItem
        todo={makeTodo()}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.queryByText("업무")).not.toBeInTheDocument();
    expect(screen.queryByText("개인")).not.toBeInTheDocument();
    expect(screen.queryByText("쇼핑")).not.toBeInTheDocument();
  });
});

describe("TodoItem 편집 - IME 조합 중 Enter", () => {
  it("IME 조합 확정용 Enter(isComposing=true)는 편집을 커밋하지 않는다", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <TodoItem
        todo={makeTodo()}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />
    );

    await user.dblClick(screen.getByText("테스트 할 일"));
    const input = screen.getByRole("textbox", { name: "할 일 편집" });
    fireEvent.change(input, { target: { value: "수정중" } });

    // 한글 마지막 글자 조합을 확정하려고 누른 Enter (isComposing=true)
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });

    expect(onEdit).not.toHaveBeenCalled();
    // 여전히 편집 모드여야 한다
    expect(
      screen.getByRole("textbox", { name: "할 일 편집" })
    ).toBeInTheDocument();
  });

  it("조합이 끝난 일반 Enter는 정상적으로 커밋한다", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <TodoItem
        todo={makeTodo()}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />
    );

    await user.dblClick(screen.getByText("테스트 할 일"));
    const input = screen.getByRole("textbox", { name: "할 일 편집" });
    fireEvent.change(input, { target: { value: "수정완료" } });

    fireEvent.keyDown(input, { key: "Enter" });

    expect(onEdit).toHaveBeenCalledExactlyOnceWith("1", "수정완료");
  });
});

function renderItem(todo: Todo = makeTodo(), onEdit = vi.fn()) {
  render(
    <TodoItem
      todo={todo}
      onToggle={vi.fn()}
      onDelete={vi.fn()}
      onEdit={onEdit}
    />
  );
  return { onEdit };
}

describe("TodoItem 편집", () => {
  it("텍스트를 더블클릭하면 편집 입력창이 나타나고 포커스된다", async () => {
    const user = userEvent.setup();
    renderItem();

    await user.dblClick(screen.getByText("테스트 할 일"));

    const input = screen.getByRole("textbox", { name: "할 일 편집" });
    expect(input).toHaveValue("테스트 할 일");
    expect(input).toHaveFocus();
  });

  it("Escape로 취소하면 onEdit을 호출하지 않고 원문을 유지한다", async () => {
    const user = userEvent.setup();
    const { onEdit } = renderItem();

    await user.dblClick(screen.getByText("테스트 할 일"));
    const input = screen.getByRole("textbox", { name: "할 일 편집" });
    await user.clear(input);
    await user.type(input, "바뀐 내용{Escape}");

    expect(onEdit).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("textbox", { name: "할 일 편집" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("테스트 할 일")).toBeInTheDocument();
  });

  it("취소 후 다시 편집하면 이전 입력 대신 원문으로 시작한다", async () => {
    const user = userEvent.setup();
    renderItem();

    await user.dblClick(screen.getByText("테스트 할 일"));
    const input = screen.getByRole("textbox", { name: "할 일 편집" });
    await user.type(input, "추가 입력{Escape}");
    await user.dblClick(screen.getByText("테스트 할 일"));

    expect(screen.getByRole("textbox", { name: "할 일 편집" })).toHaveValue(
      "테스트 할 일"
    );
  });

  it("입력창에서 포커스가 벗어나면(blur) 편집을 확정한다", async () => {
    const user = userEvent.setup();
    const { onEdit } = renderItem(makeTodo({ id: "abc" }));

    await user.dblClick(screen.getByText("테스트 할 일"));
    const input = screen.getByRole("textbox", { name: "할 일 편집" });
    await user.clear(input);
    await user.type(input, "blur로 확정");
    await user.click(document.body);

    expect(onEdit).toHaveBeenCalledExactlyOnceWith("abc", "blur로 확정");
    expect(
      screen.queryByRole("textbox", { name: "할 일 편집" })
    ).not.toBeInTheDocument();
  });

  it("빈 값으로 확정하면 onEdit(id, '')를 호출한다", async () => {
    const user = userEvent.setup();
    const { onEdit } = renderItem(makeTodo({ id: "abc" }));

    await user.dblClick(screen.getByText("테스트 할 일"));
    const input = screen.getByRole("textbox", { name: "할 일 편집" });
    await user.clear(input);
    await user.keyboard("{Enter}");

    expect(onEdit).toHaveBeenCalledExactlyOnceWith("abc", "");
  });
});

describe("TodoItem 뱃지", () => {
  it.each([
    ["high", "높음"],
    ["medium", "보통"],
    ["low", "낮음"],
  ] as const)("우선순위 %s는 '%s' 뱃지로 표시한다", (priority, label) => {
    renderItem(makeTodo({ priority }));

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("알 수 없는 우선순위는 기본값('보통') 뱃지로 표시한다", () => {
    renderItem(makeTodo({ priority: "urgent" as Todo["priority"] }));

    expect(screen.getByText("보통")).toBeInTheDocument();
  });

  it.each([
    ["personal", "개인"],
    ["shopping", "쇼핑"],
  ] as const)("카테고리 %s는 '%s' 태그로 표시한다", (category, label) => {
    renderItem(makeTodo({ category }));

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe("TodoItem 체크박스 접근성", () => {
  it("미완료 항목의 체크박스 이름은 '완료로 표시'다", () => {
    renderItem(makeTodo({ completed: false }));

    expect(
      screen.getByRole("checkbox", { name: "완료로 표시" })
    ).not.toBeChecked();
  });

  it("완료 항목의 체크박스 이름은 '완료 취소'다", () => {
    renderItem(makeTodo({ completed: true }));

    expect(screen.getByRole("checkbox", { name: "완료 취소" })).toBeChecked();
  });
});
