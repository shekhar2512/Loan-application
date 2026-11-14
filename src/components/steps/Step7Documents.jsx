import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SignatureCanvas from 'react-signature-canvas';
import FileUpload from '../common/FileUpload';
import { Checkbox } from '../common';
import { createStep7Schema } from '../../schemas/step7Schema';
import { 
  FileUp, 
  PenTool, 
  Eraser, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';

const Step7Documents = forwardRef(function Step7Documents(
  {
    defaultValues = {},
    onSave,
    isPanVerified = false,
    employmentType = 'Salaried',
  },
  ref
) {
  const schema = createStep7Schema({ isPanVerified, employmentType });
  const sigCanvasRef = useRef(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      panDocument: defaultValues.panDocument || null,
      addressProofDocument: defaultValues.addressProofDocument || null,
      incomeProofDocument: defaultValues.incomeProofDocument || null,
      signature: defaultValues.signature || '',
      signatureConsent: defaultValues.signatureConsent || false,
    },
  });

  // Restore signature onto canvas if previously saved in draft
  useEffect(() => {
    if (defaultValues.signature && sigCanvasRef.current) {
      sigCanvasRef.current.fromDataURL(defaultValues.signature);
    }
  }, [defaultValues.signature]);

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setValue('signature', dataUrl, { shouldValidate: true });
    }
  };

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setValue('signature', '', { shouldValidate: true });
    }
  };

  useImperativeHandle(ref, () => ({
    submitForm: () =>
      new Promise((resolve, reject) => {
        // Ensure signature is captured before submitting
        if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          const dataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
          setValue('signature', dataUrl);
        }

        handleSubmit(
          (data) => {
            onSave(data);
            resolve(data);
          },
          (validationErrors) => {
            reject(validationErrors);
          }
        )();
      }),
  }));

  const incomeDocTitle =
    employmentType === 'Salaried'
      ? 'Salary Slips (Last 3 Months) or Form 16'
      : 'Income Tax Returns (ITR) with Computation (Last 2 Years)';

  const incomeDocDescription =
    employmentType === 'Salaried'
      ? 'Upload recent 3 months salary slips showing gross and net deductions.'
      : 'Upload last 2 assessment years filed ITR copies with profit & loss statement.';

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* 1. Regulatory Document Notice */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-[#1F4E79] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 block text-sm">
            RBI Digital Lending Compliance (DL/2022/01)
          </span>
          <span className="leading-relaxed block mt-0.5">
            All files are compressed locally on your device via HTML5 Canvas before submission. Documents are transmitted via 256-bit TLS encryption directly to LendSwift's compliant loan management vault.
          </span>
        </div>
      </div>

      {/* 2. Document Uploads Section */}
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
          <FileUp className="w-4 h-4 text-[#1F4E79]" />
          <h3 className="text-sm font-bold text-[#1F4E79] uppercase tracking-wider">
            Required Verification Documents
          </h3>
        </div>

        <div className="space-y-4">
          {/* Doc 1: PAN Card (Rule #9: Waived if online NSDL verified in Step 3) */}
          <Controller
            name="panDocument"
            control={control}
            render={({ field }) => (
              <FileUpload
                id="panDocument"
                label="Identity Proof: PAN Card Copy"
                description="Upload clear photo or scan of your physical PAN Card."
                value={field.value}
                onChange={field.onChange}
                error={errors.panDocument?.message}
                isWaived={isPanVerified}
                waivedReason="Verified via NSDL e-KYC (No physical upload required)"
                required={!isPanVerified}
              />
            )}
          />

          {/* Doc 2: Address Proof */}
          <Controller
            name="addressProofDocument"
            control={control}
            render={({ field }) => (
              <FileUpload
                id="addressProofDocument"
                label="Current Address Proof"
                description="Aadhaar Card, Passport, Voter ID, or recent Utility Bill (last 2 months)."
                value={field.value}
                onChange={field.onChange}
                error={errors.addressProofDocument?.message}
                required
              />
            )}
          />

          {/* Doc 3: Income Proof (Rule #12: Dynamic based on employmentType) */}
          <Controller
            name="incomeProofDocument"
            control={control}
            render={({ field }) => (
              <FileUpload
                id="incomeProofDocument"
                label={incomeDocTitle}
                description={incomeDocDescription}
                value={field.value}
                onChange={field.onChange}
                error={errors.incomeProofDocument?.message}
                required
              />
            )}
          />
        </div>
      </div>

      {/* 3. Digital E-Signature Pad Section */}
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[#1F4E79]" />
            <h3 className="text-sm font-bold text-[#1F4E79] uppercase tracking-wider">
              Digital E-Signature Capture
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClearSignature}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Eraser className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Please draw your legal signature inside the signature box using your mouse, trackpad, or touchscreen.
        </p>

        {/* Signature Canvas Box */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden focus-within:border-[#1F4E79] transition-colors">
          <SignatureCanvas
            ref={sigCanvasRef}
            onEnd={handleSignatureEnd}
            penColor="#0F172A"
            canvasProps={{
              className: 'w-full h-36 cursor-crosshair touch-none',
            }}
          />
        </div>

        {errors.signature && (
          <span className="text-xs text-[#E74C3C] font-medium block">
            {errors.signature.message}
          </span>
        )}

        {/* Legal Declaration Checkbox */}
        <div className="pt-2">
          <Controller
            name="signatureConsent"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="signatureConsent"
                name={field.name}
                checked={field.value}
                onChange={field.onChange}
                label="Legal Authorization under Section 65B of Indian Evidence Act"
                description="I confirm this digital signature represents my authentic identity and serves as legal authorization for LendSwift NBFC to process this loan application."
                error={errors.signatureConsent?.message}
                required
              />
            )}
          />
        </div>
      </div>

      {/* Security Assurance */}
      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>E-Signatures are cryptographically hashed and appended to the final credit agreement.</span>
      </div>
    </form>
  );
});

export default Step7Documents;