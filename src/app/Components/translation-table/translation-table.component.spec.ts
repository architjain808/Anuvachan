import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationTableComponent } from './translation-table.component';
import { TranslateInBatchService } from 'src/app/services/translate.service';
import { UtilService } from 'src/app/services/utility.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MessageService } from 'primeng/api';
import { BrowserModule } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { of } from 'rxjs';

describe('TranslationTableComponent', () => {
  let component: TranslationTableComponent;
  let fixture: ComponentFixture<TranslationTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TranslationTableComponent],
      providers: [
        TranslateInBatchService,
        UtilService,
        Clipboard,
        MessageService,
      ],
      imports: [
        BrowserModule,
        TableModule,
        AppRoutingModule,
        RippleModule,
        RadioButtonModule,
        CheckboxModule,
        ToastModule,
        FormsModule,
        HttpClientModule,
      ],
    });
    fixture = TestBed.createComponent(TranslationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should flatten', () => {
    expect(component.flattenObject({ test: { abc: 'test' } })).toEqual({
      test__abc: 'test',
    });
    expect(component.flattenObject({ test: { abc: 'test' } })).toBeInstanceOf(
      Object
    );
    expect(component.flattenObject({ test: { abc: 'test' } })).not.toBeNull();
  });

  it('should set data', () => {
    let mockFile = `Test
    Test`;
    component.inputText = mockFile;
    spyOn(component.JSONFile, 'setValue').and.callThrough();
    component.setData(mockFile);
    expect(component.JSONFile.setValue).toHaveBeenCalledWith(
      component.convertTextToJSON(mockFile)
    );
  });

  it('should check API call', () => {
    let translateService = fixture.debugElement.injector.get(
      TranslateInBatchService
    );
    spyOn(translateService, 'getBhashiniTranslation').and.callFake(
      (language: string, inputPayload: { source: string }[]) => {
        return of([{ result: 200 }]);
      }
    );
  });
});
