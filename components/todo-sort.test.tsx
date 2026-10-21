import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoSort } from "@/components/todo-sort";

describe("TodoSort", () => {
  it("생성일순·이름순 정렬 옵션을 렌더링한다", () => {
    render(<TodoSort value="created" onChange={vi.fn()} />);

    expect(
      screen.getByRole("radio", { name: "생성일순" })
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "이름순" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "마감일순" })
    ).toBeInTheDocument();
  });

  it("현재 정렬 옵션만 선택 상태로 표시된다", () => {
    render(<TodoSort value="name" onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "이름순" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "생성일순" })).not.toBeChecked();
  });

  it("정렬 옵션을 클릭하면 해당 값으로 onChange를 호출한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TodoSort value="created" onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "이름순" }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith("name");
  });
});

describe("TodoSort 마감일순", () => {
  it("value가 'due'이면 '마감일순'만 선택 상태다", () => {
    render(<TodoSort value="due" onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "마감일순" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "생성일순" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "이름순" })).not.toBeChecked();
  });

  it("'마감일순'을 클릭하면 'due'로 onChange를 호출한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TodoSort value="created" onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "마감일순" }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith("due");
  });
});
