import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnInit,
  ViewChild,
} from '@angular/core'
import { ElTooltipConfig } from './tooltip-config'
import { TooltipConfigType, PositionType} from './tooltip.interface'
import { Utils } from '../shared'

@Component({
  selector: 'el-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'el-tooltip__popper is-' + checkedCtx.effect + ' ' + checkedCtx.popperClass"
      style="left: -1000px; top: -1000px;"
      [hidden]="!showPopper"
      [attr.x-placement]="xPlacement"
      #popperContent
    >
      <div x-arrow class="popper__arrow" [hidden]="!checkedCtx['visible-arrow']"></div>
      {{ checkedCtx.content }}
    </div>
    <div #popperHost>
      <ng-content>
      </ng-content>
    </div>
  `,
  providers: [ElTooltipConfig],
})
export class ElTooltip implements AfterContentInit, OnInit {
  
  @Input() context: TooltipConfigType
  @ViewChild('popperHost') popperHost: ElementRef
  @ViewChild('popperContent') popperContent: ElementRef
  
  constructor(
    private el: ElementRef,
    private config: ElTooltipConfig,
    private changeDetectorRef: ChangeDetectorRef,
    ) {
  }
  
  private checkedCtx: ElTooltipConfig
  private xPlacement: string = this.config.placement
  private showPopper: boolean = true
  
  getPosition(host: HTMLElement, self: HTMLElement): void {
    // ensure accuracy
    this.changeDetectorRef.detectChanges()
    const hostRect = Utils.getBoundingClientRect(host)
    const selfRect = { width: self.offsetWidth, height: self.offsetHeight }
    // reset element
    this.changeDetectorRef.reattach()
    this.showPopper = false
  
    const placement: string = this.checkedCtx.placement
    const doubleConventions: boolean = placement.includes('-')
    const arrowDir: string = doubleConventions ? placement.split('-')[1] : 'center'
    const dir: string = doubleConventions ? placement.split('-')[0] : placement
    const position: PositionType = Utils.getPositionForDir(hostRect, selfRect, dir, arrowDir)
    
    this.bindEvent(host)
    this.setPopperPosition(self, position)
  }
  
  setPopperPosition(self: HTMLElement, position: PositionType): void {
    const arrowElement: Element = self.querySelector('.popper__arrow')
    this.xPlacement = position.arrowFace
    self.style.left = `${position.left}px`
    self.style.top = `${position.top}px`
    arrowElement.setAttribute('style', `${position.arrowDir}: ${position.arrowPosition}px`)
  }
  
  bindEvent(host: HTMLElement): void {
    host.addEventListener('mouseenter', () => {
      this.showPopper = true
      this.changeDetectorRef.markForCheck()
    })
    host.addEventListener('mouseleave', () => {
      this.showPopper = false
      this.changeDetectorRef.markForCheck()
    })
  }
  
  ngAfterContentInit(): void {
    let children = this.popperHost.nativeElement.children
    if (!children) return console.warn('el-tooltip component must have a child')
    if (children[0].tagName.indexOf('EL-') > -1) {
      children = children[0].children
    }
    
    const self: HTMLElement = this.popperContent.nativeElement
    const timer: number = setTimeout(() => {
      this.getPosition(children[0], self)
      clearTimeout(timer)
    }, 0)
  }
  
  ngOnInit(): void {
    this.checkedCtx = Object.assign(this.context, this.config)
  }
  
}