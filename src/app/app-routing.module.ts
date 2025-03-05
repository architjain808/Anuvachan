import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslationTableComponent } from './Components/translation-table/translation-table.component';

const routes: Routes = [
  {
    path: '',
    component: TranslationTableComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
