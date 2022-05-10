import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Evento } from 'src/app/Models/Evento';
import { Lote } from 'src/app/Models/Lote';
import { EventoService } from 'src/app/services/evento.service';
import { LoteService } from 'src/app/services/lote.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.css']
})
export class EventoDetalheComponent implements OnInit {

  modelRef: BsModalRef;
  loteAtual = {id: 0, nome:'', indice: 0}
  eventoId!: number;
  imagemURL = 'assets/upload.png';
  evento = {} as Evento;
  form!: FormGroup;
  estadoSalvar = 'post';
  file: File;


  get modoEditar():boolean {
    return this.estadoSalvar == 'put';
  }

  get lotes(): FormArray {
    return this.form.get('lotes') as FormArray;
  }

  get f(): any{
    return this.form.controls;
  }

  get bsConfig(): any {
    return { isAnimated: true, adaptivePosition: true, dateInputFormat: 'DD/MM/YYYY hh:mm a',
            containerClass: 'theme-default', showWeekNumbers: false}
  }

  constructor(private fb: FormBuilder,
              private localeService: BsLocaleService, private activatedRouter: ActivatedRoute,
              private eventoService: EventoService, private spinner: NgxSpinnerService,
              private toastr: ToastrService, private router: Router, private loteService: LoteService,
              private modelService: BsModalService) {
    this.localeService.use('pt-br');
  }

  public carregarEvento(): void {
    this.eventoId = +this.activatedRouter.snapshot.paramMap.get('id')!;

    if(this.eventoId != null && this.eventoId != 0) {
      this.spinner.show();

      this.estadoSalvar = 'put';

      this.eventoService.getEventoById(this.eventoId).subscribe(
        (evento: Evento) => { this.evento = {...evento};
        this.form.patchValue(this.evento);
        if(this.evento.imagemURL != '') {
          this.imagemURL = environment.apiURL + 'resources/images/' + this.evento.imagemURL;
        }
        this.carregarLotes();
      },
        (error: any) => { this.spinner.hide(), this.toastr.error('Erro ao tentar carregar Evento.', 'Erro!'), console.error(error);
        },
        () => this.spinner.hide()
      );
    }
  }

  public carregarLotes():void{
    this.loteService.getLotesByEventoId(this.eventoId).subscribe(
      (lotes: Lote[]) => {
        lotes.forEach(lote => {
            this.lotes.push(this.criarLote(lote));
        });
      },
      (error: any) => {
        this.toastr.error('Erro ao tentar carregar Lotes', 'Erro');
        console.log(error);
      }
    ).add(() => this.spinner.hide());
  }

  ngOnInit() {
    this.carregarEvento();
    this.validation();
  }

  public validation(): void {
    this.form = this.fb.group({
      local: ['',Validators.required],
      dataEvento: ['',Validators.required],
      tema: ['',[Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      quantidadePessoas: ['',[Validators.required, Validators.max(120000)]],
      imagemURL: [''],
      telefone: ['',Validators.required],
      email: ['',[Validators.required, Validators.email]],
      lotes: this.fb.array([])
    });
  }

  adicionarLote():void{
    this.lotes.push(this.criarLote({id:0} as Lote));
  }


  criarLote(lote: Lote):FormGroup {
    return this.fb.group({
        id: [lote.id],
        nome: [lote.nome, Validators.required],
        quantidade: [lote.quantidade, Validators.required],
        preco: [lote.preco, Validators.required],
        dataInicio: [lote.dataInicio],
        dataFim: [lote.dataFim]})
  }

  public mudarValorData(value: Data, indice: number, campo: string):void {
    this.lotes.value[indice][campo] = value;
  }

  public retornaTituloLote(nome: string): string {
    return nome == null || nome =='' ? 'Nome do Lote' : nome;
  }

  resetForm():void{
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl | AbstractControl | null): any{
    return {'is-invalid': campoForm?.errors && campoForm?.touched};
  }

  public salvarEvento():void {
    this.spinner.show();
    if(!this.form.invalid){

    this.evento = (this.estadoSalvar == 'post')
                  ? {...this.form.value}
                  : {id: this.evento.id, ...this.form.value};

        this.eventoService[this.estadoSalvar](this.evento).subscribe(
        (eventoRetorno: Evento) =>  {
          this.toastr.success('Evento salvo com sucesso', 'Sucesso');
          this.router.navigate([`eventos/detalhe/${eventoRetorno.id}`]);
        },

        (error: any) => {console.error(error);
          this.spinner.hide();
          this.toastr.error('Erro ao salvar Evento', 'Erro!')
        },
        () => {this.spinner.hide()
        });
    }
  }

  public salvarLotes():void{
    if(this.form.controls['lotes'].valid) {
      this.spinner.show();
      this.loteService.saveLote(this.eventoId, this.form.value.lotes).subscribe(
        () => {
          this.toastr.success('Lotes salvos com Sucesso', 'Sucesso!');
          this.lotes.reset();
        },
        (error: any) => {this.toastr.error('Erro ao salvar Lotes', 'Erro');
      console.error(error);
    }
      ).add(() => this.spinner.hide);
    }
  }

  public removerLote(template: TemplateRef<any>, indice: number):void {

    this.loteAtual.id = this.lotes.get(indice + '.id').value;
    this.loteAtual.nome = this.lotes.get(indice + '.nome').value;
    this.loteAtual.indice = indice;

      this.modelRef = this.modelService.show(template, {class: 'modal-sm'});
  }

  confirmDeleteLote():void {
  this.modelRef.hide();
  this.spinner.show();

  this.loteService.deleteLote(this.eventoId, this.loteAtual.id).subscribe(
    () => {
      this.toastr.success('Lote deletado com sucesso', 'Sucesso');
      this.lotes.removeAt(this.loteAtual.indice);
    },
    (error: any) => {
      this.toastr.error(`Erro ao tentar deletar o lote ${this.loteAtual.id}`);
      console.error(error);
    }
  ).add(() => this.spinner.hide);
  }

  declineDeleteLote():void {
    this.modelRef.hide();
  }

  onFileChange(evento: any): void {
    const reader = new FileReader();
    reader.onload = (event: any) => this.imagemURL = event.target.result;
    this.file = evento.target.files;
    reader.readAsDataURL(this.file[0]);

    this.uploadImage();
  }

  uploadImage(): void {
    this.spinner.show();
    this.eventoService.postUpload(this.eventoId, this.file).subscribe(
      () => {
        this.carregarEvento();
        this.toastr.success('Imagem atualizada com sucesso', 'Sucesso!');
      },
      (error: any) => {
          this.toastr.error('Erro ao carregar a Imagem', 'Erro!');
          console.log(error);
      }
    ).add(() => this.spinner.hide);
  }
}
