import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { CertificationService } from '../_services';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CertificationGuard implements CanActivate {
  public constructor(
    private router: Router,
    private certificationService: CertificationService,
  ) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return (
      this.certificationService.CheckHolding()
      .pipe(tap( hasCertification => {
        if ( !hasCertification ) {
          this.router.navigate(['/unauthorized']);
        }
      }))
    );
  }

}
