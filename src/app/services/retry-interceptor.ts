import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { retryWhen, mergeMap, delay, take } from 'rxjs/operators';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  private readonly retryCount = 3;
  private readonly retryDelay = 1000; // 1 second delay between retries

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error: HttpErrorResponse, retryAttempt: number) => {
            if (retryAttempt < this.retryCount && error.status === 504) {
              // Retry after a delay if status is 504
              return of(error).pipe(delay(this.retryDelay));
            }
            // If it's not a 504 error or retry attempts exceeded, throw the error
            return throwError(error);
          }),
          take(this.retryCount)
        )
      )
    );
  }
}
