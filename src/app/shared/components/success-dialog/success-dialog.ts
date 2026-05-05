import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SuccessDialogData {
  message: string;
  email: string;
}

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./success-dialog.html",
  styleUrl: "./success-dialog.scss"
})
export class SuccessDialog {
 constructor(
  @Inject(MAT_DIALOG_DATA) public data: SuccessDialogData,
  @Inject(MatDialogRef) private dialogRef: MatDialogRef<SuccessDialog>
) {}

  onGoToLogin(): void {
    this.dialogRef.close({ action: 'login' });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}