import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, zip } from 'rxjs';

import { INetsuiteFile } from '../_interfaces';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {

  @Input() public Progress : string;
  @Output() public FileEvent = new EventEmitter<any>();
  public onChange: Function;
  public InstFile : any;
  public fileData: FormData;
  public form = this.formBuilder.group({
    file: null
  });
  private fileInfo$: Subject<any> = new Subject();
  private document$: Subject<any> = new Subject();
  // private base64$: Subject<any>;

  @HostListener('change', ['$event.target.files']) emitFiles( fileEvent: FileList ) {
    const MyFile = fileEvent && fileEvent.item(0);
    this.onChange(MyFile);
    if ( !MyFile ) return;
    // propogate the event to the parent element
    // store the file and nomenclature in JSON
    var regex = MyFile.name.split(/(\.)/);
    let Event = {
      Name: MyFile.name,
      Type: regex[regex.length - 1]
    };
    console.log(Event);
    this.fileInfo$.next(Event);
  }

  public constructor(
    private FileHost: ElementRef<HTMLInputElement>,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef
  ) {
    // We need to concatenate the information from both file element methods
    this.fileInfo$ = new Subject();
    this.document$ = new Subject();
    // this.base64$ = new Subject();
    // Zip will take one value from each observable and combine them
    // Because the information calls are asynchronous
    zip(this.fileInfo$, this.document$)
    .pipe(
      map(([fileInfo, document]) => ({
        Name:fileInfo ? fileInfo.Name : '',
        Type: fileInfo.Type,
        Document: document,
      } as INetsuiteFile
      ))
    ).subscribe(
      (_value/*: INetsuiteFile*/) => {
        this.FileEvent.next(_value);
      }
    );
  }

  public writeValue( value: null ) {
    // clear file input
    this.FileHost.nativeElement.value = '';
    this.InstFile = null;
  }

  public registerOnChange( fn: Function ) {
    this.onChange = fn; //????
  }

  public registerOnTouched( fn: Function ) {

  }
  // This event has access to the actual file contents so we move the file into the component here
  // @Host fires next and will append type and filename to the package
  public onFileChanged(event) {
    // console.log('onFileChange');
    console.log(event);
    // if ( event.target.files.length > 0 ) {
    //   // get the first file (also the only)
    //   this.InstFile = event.target.files[0];
    //   // reset the formData element so we can properly send this to the server
    //   this.fileData = new FormData();
    //   this.fileData.append('upload', this.InstFile, this.InstFile.name );
    // }
    let reader = new FileReader();
    // let readerText = new FileReader();
    // let readerArrayBufer = new FileReader();
    // let readerDataURL = new FileReader();
    if(event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      // readerText.readAsText(file);
      // readerText.onload = () => {
      //   console.log(`Text: ${readerText.result}`);
      // }
      // readerArrayBufer.readAsArrayBuffer(file);
      // readerArrayBufer.onload = () => {
      //   console.log(`ArrayBuffer: ${readerArrayBufer.result}`);
      // }
      // readerDataURL.readAsDataURL(file);
      // readerDataURL.onload = () => {
        // console.log(`DataURL: ${readerDataURL.result}`);
        // this.base64$.next(readerDataURL.result);
      // }
      // reader.readAsText(file);
      reader.readAsDataURL(file);
      reader.onload = () => {
        // console.log(`Binary: ${reader.result}`);
        this.form.patchValue({
          file: reader.result
        });
        // propogate the file to the parent
        this.document$.next(reader.result);
        // this.FileEvent.next(reader.result); // NOTE - this line works for propogation to NS with data:text/plain;base64 styling
        // need to run CD since file load runs outside of zone
        this.changeDetector.markForCheck();
      };
    }
  }
}
