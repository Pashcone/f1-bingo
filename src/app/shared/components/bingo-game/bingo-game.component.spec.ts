import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BingoGameComponent } from './bingo-game.component';

describe('BingoGameComponent', () => {
  let component: BingoGameComponent;
  let fixture: ComponentFixture<BingoGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BingoGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BingoGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
