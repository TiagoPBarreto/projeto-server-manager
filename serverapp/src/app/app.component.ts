import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, catchError, map, Observable, of, startWith } from 'rxjs';
import { DataState } from './enum/data-state.enum';
import { Status } from './enum/status.enum';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { Server } from './interface/server';
import { NotificationService } from './service/notification.service';
import { ServerService } from './service/server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  appState$: Observable<AppState<CustomResponse>>
  readonly DataState = DataState;
  readonly Status = Status
  private filterSubject = new BehaviorSubject<String>('')
  private dataSubject = new BehaviorSubject<CustomResponse>(null)
  filterStatus$ = this.filterSubject.asObservable()
  private isLoading = new BehaviorSubject<boolean>(false)
  isLoading$ = this.isLoading.asObservable()
  

  constructor(private serverService: ServerService, private notifier:NotificationService) { }

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
      .pipe(
        map(Response => {
          this.notifier.onDefault(Response.message)
          this.dataSubject.next(Response)
          return { dataState: DataState.LOADED_STATE, 
            appData: {...Response, data:{ servers:Response.data.servers.reverse()}} }
        }),
        startWith({ dataState: DataState.LOADED_STATE }),
        catchError((error: string) => {
          this.notifier.onError(error)
          return of({ dataState: DataState.ERROR_STATE, error: error })
        })
      )
  }

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress)
    this.appState$ = this.serverService.ping$(ipAddress)
      .pipe(
        map(Response => {
          const index = this.dataSubject.value.data.servers.findIndex(server =>
            server.id === Response.data.server.id )
          this.dataSubject.value.data.servers[index] = Response.data.server 
          this.notifier.onDefault(Response.message)
          this.filterSubject.next('')
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => { 
          this.filterSubject.next('')
          this.notifier.onError(error)
          return of({ dataState: DataState.ERROR_STATE, error: error })
        })
      )
  }

  saveServer(serverForm: NgForm): void {
    this.isLoading.next(true)
    this.appState$ = this.serverService.save$(serverForm.value as Server)
      .pipe(
        map(Response => {
          this.dataSubject.next(
            {...Response, data: {servers: [Response.data.server, ...this.dataSubject.value.data.servers]}}
          )
          this.notifier.onDefault(Response.message)
          document.getElementById('closeModal').click()
          this.isLoading.next(false)
          serverForm.resetForm({ status: this.Status.SERVER_DOW})
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => { 
          this.isLoading.next(false)
          this.notifier.onError(error)
          return of({ dataState: DataState.ERROR_STATE, error: error })
        })
      )
  }

  filterServers(status: Status): void {
    
    this.appState$ = this.serverService.filter$(status,this.dataSubject.value)
      .pipe(
        map(Response => {
          this.notifier.onDefault(Response.message)
          return { dataState: DataState.LOADED_STATE, appData: Response }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => { 
          this.notifier.onError(error)
          return of({ dataState: DataState.ERROR_STATE, error: error })
        })
      )
  }

  deleteServer(server: Server): void {
    
    this.appState$ = this.serverService.delete$(server.id)
      .pipe(
        map(Response => {
          this.dataSubject.next(
            {...Response, data: 
              { servers: this.dataSubject.value.data.servers.filter(s => s.id !== server.id)}}
          )
          this.notifier.onDefault(Response.message)
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => { 
          this.notifier.onError(error)
          return of({ dataState: DataState.ERROR_STATE, error: error })
        })
      )
  }

  printReport(): void {
    this.notifier.onDefault('Report Dowload')
   // window.print
      let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12'
      let tableSelect = document.getElementById('servers')
      let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20')
      let dowloadLink = document.createElement('a')
      document.body.appendChild(dowloadLink)
      dowloadLink.href = 'data:' + dataType + ', '+ tableHtml
      dowloadLink.download = 'server-report.xls'
      dowloadLink.click()
      document.body.removeChild(dowloadLink)
  }
}
