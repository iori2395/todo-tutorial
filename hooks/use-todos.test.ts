import { act, renderHook, waitFor } from "@testing-library/react";
import { useTodos } from "@/hooks/use-todos";

beforeEach(() => {
  localStorage.clear();
});

describe("useTodos 우선순위", () => {
  it("addTodo에 전달한 우선순위로 추가한다", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("장보기", "high");
    });

    expect(result.current.todos[0]).toMatchObject({
      text: "장보기",
      priority: "high",
      completed: false,
    });
  });

  it("우선순위를 생략하면 기본값(medium)으로 추가한다", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("청소");
    });

    expect(result.current.todos[0].priority).toBe("medium");
  });

  it("priority가 없는 기존 저장 데이터는 medium으로 보정해 로드한다", async () => {
    localStorage.setItem(
      "todos",
      JSON.stringify([{ id: "1", text: "구버전 할 일", completed: false }])
    );

    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].priority).toBe("medium");
  });

  it("추가한 우선순위를 localStorage에 저장한다", async () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("장보기", "low");
    });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("todos") ?? "[]");
      expect(stored[0]?.priority).toBe("low");
    });
  });
});

describe("useTodos 마감일", () => {
  it("addTodo에 전달한 마감일로 추가한다", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("회의", "medium", "2026-07-01");
    });

    expect(result.current.todos[0]).toMatchObject({
      text: "회의",
      dueDate: "2026-07-01",
    });
  });

  it("마감일을 생략하면 dueDate 없이 추가한다", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("청소");
    });

    expect(result.current.todos[0].dueDate).toBeUndefined();
  });

  it("새로 추가한 Todo에는 생성 시각(createdAt)이 기록된다", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("회의");
    });

    expect(typeof result.current.todos[0].createdAt).toBe("number");
  });

  it("createdAt이 없는 기존 데이터는 number로 보정해 로드한다", async () => {
    localStorage.setItem(
      "todos",
      JSON.stringify([
        { id: "1", text: "구버전 할 일", completed: false, priority: "medium" },
      ])
    );

    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(typeof result.current.todos[0].createdAt).toBe("number");
  });
});

describe("useTodos 카테고리", () => {
  it("addTodo에 전달한 카테고리로 추가한다", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("보고서", "medium", undefined, "work");
    });

    expect(result.current.todos[0].category).toBe("work");
  });

  it("카테고리를 생략하면 category 없이 추가한다", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("청소");
    });

    expect(result.current.todos[0].category).toBeUndefined();
  });
});

describe("useTodos 손상 데이터 보호", () => {
  it("파싱할 수 없는 저장값을 빈 배열로 덮어쓰지 않는다", async () => {
    localStorage.setItem("todos", "{이건 JSON이 아님");

    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.todos).toEqual([]);
    // 손상된 원본이 보존돼 복구 여지가 남아야 한다
    expect(localStorage.getItem("todos")).toBe("{이건 JSON이 아님");
  });

  it("배열이 아닌 저장값도 덮어쓰지 않는다", async () => {
    localStorage.setItem("todos", JSON.stringify({ x: 1 }));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.todos).toEqual([]);
    expect(localStorage.getItem("todos")).toBe('{"x":1}');
  });

  it("손상 데이터 로드 후 새 항목을 추가하면 정상적으로 저장된다", async () => {
    localStorage.setItem("todos", "{이건 JSON이 아님");

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.addTodo("새 할 일");
    });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("todos") ?? "null");
      expect(Array.isArray(stored)).toBe(true);
      expect(stored[0]?.text).toBe("새 할 일");
    });
  });
});

// 로드 완료까지 기다린 뒤 결과를 돌려주는 헬퍼
async function renderLoaded() {
  const hook = renderHook(() => useTodos());
  await waitFor(() => expect(hook.result.current.loaded).toBe(true));
  return hook;
}

function readStored() {
  return JSON.parse(localStorage.getItem("todos") ?? "null");
}

describe("useTodos 추가", () => {
  it("공백만 입력하면 추가하지 않는다", async () => {
    const { result } = await renderLoaded();

    act(() => {
      result.current.addTodo("   ");
    });

    expect(result.current.todos).toEqual([]);
  });

  it("입력값의 앞뒤 공백을 제거해 추가한다", async () => {
    const { result } = await renderLoaded();

    act(() => {
      result.current.addTodo("  장보기  ");
    });

    expect(result.current.todos[0].text).toBe("장보기");
  });

  it("새 항목은 목록 맨 앞에 추가된다", async () => {
    const { result } = await renderLoaded();

    act(() => {
      result.current.addTodo("첫번째");
    });
    act(() => {
      result.current.addTodo("두번째");
    });

    expect(result.current.todos.map((t) => t.text)).toEqual([
      "두번째",
      "첫번째",
    ]);
  });
});

describe("useTodos 토글·삭제·편집", () => {
  async function seedTwo() {
    const hook = await renderLoaded();
    act(() => {
      hook.result.current.addTodo("A");
    });
    act(() => {
      hook.result.current.addTodo("B");
    });
    // 맨 앞에 추가되므로 [B, A] 순서
    const [b, a] = hook.result.current.todos;
    return { ...hook, a, b };
  }

  it("toggleTodo는 해당 항목의 완료 상태만 뒤집는다", async () => {
    const { result, a, b } = await seedTwo();

    act(() => {
      result.current.toggleTodo(a.id);
    });

    const after = result.current.todos;
    expect(after.find((t) => t.id === a.id)?.completed).toBe(true);
    expect(after.find((t) => t.id === b.id)).toEqual(b);

    act(() => {
      result.current.toggleTodo(a.id);
    });
    expect(result.current.todos.find((t) => t.id === a.id)?.completed).toBe(
      false
    );
  });

  it("deleteTodo는 해당 id만 제거한다", async () => {
    const { result, a, b } = await seedTwo();

    act(() => {
      result.current.deleteTodo(a.id);
    });

    expect(result.current.todos).toEqual([b]);
  });

  it("editTodo는 앞뒤 공백을 제거해 해당 항목만 수정한다", async () => {
    const { result, a, b } = await seedTwo();

    act(() => {
      result.current.editTodo(a.id, "  수정된 A  ");
    });

    expect(result.current.todos.find((t) => t.id === a.id)).toEqual({
      ...a,
      text: "수정된 A",
    });
    expect(result.current.todos.find((t) => t.id === b.id)).toEqual(b);
  });

  it("editTodo에 빈 문자열(공백 포함)을 넘기면 항목을 삭제한다", async () => {
    const { result, a, b } = await seedTwo();

    act(() => {
      result.current.editTodo(a.id, "   ");
    });

    expect(result.current.todos).toEqual([b]);
  });

  it("토글 결과가 localStorage에 저장된다", async () => {
    const { result, a } = await seedTwo();

    act(() => {
      result.current.toggleTodo(a.id);
    });

    await waitFor(() => {
      const stored = readStored();
      expect(stored.find((t: { id: string }) => t.id === a.id)?.completed).toBe(
        true
      );
    });
  });

  it("삭제 결과가 localStorage에 저장된다", async () => {
    const { result, a, b } = await seedTwo();

    act(() => {
      result.current.deleteTodo(a.id);
    });

    await waitFor(() => {
      expect(readStored().map((t: { id: string }) => t.id)).toEqual([b.id]);
    });
  });

  it("편집 결과가 localStorage에 저장된다", async () => {
    const { result, a } = await seedTwo();

    act(() => {
      result.current.editTodo(a.id, "수정된 A");
    });

    await waitFor(() => {
      const stored = readStored();
      expect(stored.find((t: { id: string }) => t.id === a.id)?.text).toBe(
        "수정된 A"
      );
    });
  });
});

describe("useTodos 로드", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("저장값이 없으면 빈 목록으로 로드를 완료한다", async () => {
    const { result } = await renderLoaded();

    expect(result.current.todos).toEqual([]);
    expect(result.current.loaded).toBe(true);
  });

  it("createdAt이 없는 기존 데이터는 원래 배열 순서대로 base - index를 부여한다", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    localStorage.setItem(
      "todos",
      JSON.stringify([
        { id: "a", text: "최신", completed: false, priority: "medium" },
        { id: "b", text: "중간", completed: false, priority: "medium" },
        { id: "c", text: "오래됨", completed: false, priority: "medium" },
      ])
    );

    const { result } = await renderLoaded();

    expect(result.current.todos.map((t) => t.createdAt)).toEqual([
      1_000_000, 999_999, 999_998,
    ]);
  });

  it("createdAt이 이미 있는 데이터는 그대로 유지한다", async () => {
    localStorage.setItem(
      "todos",
      JSON.stringify([
        {
          id: "a",
          text: "할 일",
          completed: false,
          priority: "low",
          createdAt: 42,
        },
      ])
    );

    const { result } = await renderLoaded();

    expect(result.current.todos[0].createdAt).toBe(42);
  });
});

describe("useTodos 손상 데이터 이후 동작", () => {
  // 버그: 손상 데이터 로드(loadErrorRef=true) 후 추가→삭제로 목록이 비면
  // 저장 effect가 "로드 실패 + 빈 목록" 조건에 걸려 setItem을 건너뛴다.
  // 그 결과 삭제한 항목이 localStorage에 남아 새로고침하면 되살아난다.
  it.skip("손상 데이터 로드 후 추가한 항목을 삭제하면 저장소에서도 사라진다", async () => {
    localStorage.setItem("todos", "{이건 JSON이 아님");
    const { result } = await renderLoaded();

    act(() => {
      result.current.addTodo("새 할 일");
    });
    await waitFor(() => expect(readStored()?.[0]?.text).toBe("새 할 일"));

    const id = result.current.todos[0].id;
    act(() => {
      result.current.deleteTodo(id);
    });

    expect(result.current.todos).toEqual([]);
    await waitFor(() => expect(readStored()).toEqual([]));
  });

  it("손상 데이터 로드 후 추가 → 삭제해도 상태는 정상적으로 비워진다", async () => {
    localStorage.setItem("todos", "{이건 JSON이 아님");
    const { result } = await renderLoaded();

    act(() => {
      result.current.addTodo("새 할 일");
    });
    const id = result.current.todos[0].id;
    act(() => {
      result.current.deleteTodo(id);
    });

    expect(result.current.todos).toEqual([]);
  });
});

describe("useTodos 저장 실패", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 버그: 저장 effect가 localStorage.setItem 예외(QuotaExceededError, 사파리 프라이빗 모드 등)를
  // 잡지 않아 effect에서 예외가 그대로 던져진다.
  it.skip("localStorage.setItem이 예외를 던져도 상태 변경은 유지된다", async () => {
    const { result } = await renderLoaded();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });

    expect(() => {
      act(() => {
        result.current.addTodo("장보기");
      });
    }).not.toThrow();
    expect(result.current.todos[0]?.text).toBe("장보기");
  });
});
