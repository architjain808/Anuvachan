import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { TranslationTableComponent } from "./Components/translation-table/translation-table.component";
import { TableModule } from "primeng/table";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CheckboxModule } from "primeng/checkbox";
import { ToastModule } from "primeng/toast";
import { RippleModule } from "primeng/ripple";
import { MessageService } from "primeng/api";
import { FileUploadModule } from "primeng/fileupload";
import { ProgressBarModule } from "primeng/progressbar";
import { RadioButtonModule } from "primeng/radiobutton";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { RetryInterceptor } from "./services/retry-interceptor";
import { APP_BASE_HREF } from "@angular/common";
@NgModule({
  declarations: [AppComponent, TranslationTableComponent],
  imports: [
    BrowserModule,
    TableModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RippleModule,
    RadioButtonModule,
    CheckboxModule,
    MatInputModule,
    ToastModule,
    FormsModule,
    HttpClientModule,
    ProgressBarModule,
    MatInputModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    FileUploadModule,
  ],
  providers: [
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RetryInterceptor,
      multi: true,
    },
    { provide: APP_BASE_HREF, useValue: `/Anuvachan/` },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
