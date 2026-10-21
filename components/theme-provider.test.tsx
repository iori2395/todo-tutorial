import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";

// next-themes는 jsdom에 없는 matchMedia·<html> class 조작에 의존하므로,
// 단축키 로직만 검증하도록 useTheme을 모킹한다.
const theme = vi.hoisted(() => ({
  resolvedTheme: "light" as string | undefined,
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => theme,
}));

beforeEach(() => {
  theme.resolvedTheme = "light";
  theme.setTheme.mockClear();
});

function renderProvider(children: React.ReactNode = null) {
  return render(<ThemeProvider>{children}</ThemeProvider>);
}

describe("ThemeProvider 단축키(d)", () => {
  it("라이트 모드에서 d를 누르면 다크 모드로 전환한다", () => {
    renderProvider();

    fireEvent.keyDown(document.body, { key: "d" });

    expect(theme.setTheme).toHaveBeenCalledExactlyOnceWith("dark");
  });

  it("다크 모드에서 d를 누르면 라이트 모드로 전환한다", () => {
    theme.resolvedTheme = "dark";
    renderProvider();

    fireEvent.keyDown(document.body, { key: "d" });

    expect(theme.setTheme).toHaveBeenCalledExactlyOnceWith("light");
  });

  it("대문자 D(Shift+d)도 토글한다", () => {
    renderProvider();

    fireEvent.keyDown(document.body, { key: "D", shiftKey: true });

    expect(theme.setTheme).toHaveBeenCalledExactlyOnceWith("dark");
  });

  it("d가 아닌 키는 무시한다", () => {
    renderProvider();

    fireEvent.keyDown(document.body, { key: "f" });

    expect(theme.setTheme).not.toHaveBeenCalled();
  });

  it("자식 요소를 그대로 렌더링한다", () => {
    renderProvider(<p>내용</p>);

    expect(screen.getByText("내용")).toBeInTheDocument();
  });
});

describe("ThemeProvider 단축키 무시 조건", () => {
  it.each(["input", "textarea", "select"])(
    "%s에 포커스된 상태에서는 무시한다",
    (tag) => {
      renderProvider();
      const el = document.createElement(tag);
      document.body.appendChild(el);

      fireEvent.keyDown(el, { key: "d" });

      expect(theme.setTheme).not.toHaveBeenCalled();
      el.remove();
    }
  );

  it("contenteditable 요소에서는 무시한다", () => {
    renderProvider();
    const el = document.createElement("div");
    el.contentEditable = "true";
    // jsdom은 isContentEditable을 구현하지 않으므로 브라우저 동작을 흉내낸다.
    Object.defineProperty(el, "isContentEditable", { value: true });
    document.body.appendChild(el);

    fireEvent.keyDown(el, { key: "d" });

    expect(theme.setTheme).not.toHaveBeenCalled();
    el.remove();
  });

  it.each([
    ["Ctrl", { ctrlKey: true }],
    ["Meta", { metaKey: true }],
    ["Alt", { altKey: true }],
  ])("%s 조합이면 무시한다", (_name, modifier) => {
    renderProvider();

    fireEvent.keyDown(document.body, { key: "d", ...modifier });

    expect(theme.setTheme).not.toHaveBeenCalled();
  });

  it("키를 누르고 있어 반복 입력(event.repeat)되면 무시한다", () => {
    renderProvider();

    fireEvent.keyDown(document.body, { key: "d", repeat: true });

    expect(theme.setTheme).not.toHaveBeenCalled();
  });

  it("다른 핸들러가 preventDefault한 이벤트는 무시한다", () => {
    renderProvider();
    const prevent = (event: Event) => event.preventDefault();
    document.body.addEventListener("keydown", prevent);

    fireEvent.keyDown(document.body, { key: "d" });

    expect(theme.setTheme).not.toHaveBeenCalled();
    document.body.removeEventListener("keydown", prevent);
  });

  it("언마운트하면 keydown 리스너를 해제한다", () => {
    const { unmount } = renderProvider();
    unmount();

    fireEvent.keyDown(document.body, { key: "d" });

    expect(theme.setTheme).not.toHaveBeenCalled();
  });
});
