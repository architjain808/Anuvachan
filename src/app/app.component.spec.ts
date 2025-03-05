import { TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";

import { AppRoutingModule } from "src/app/app-routing.module";
describe("AppComponent", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [AppRoutingModule],
      declarations: [AppComponent],
    })
  );

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Anuvachan'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual("Anuvachan");
  });

  xit("should render initial title", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector(".content span")?.textContent).toContain(
      "Anuvachan app is running!"
    );
  });
});
