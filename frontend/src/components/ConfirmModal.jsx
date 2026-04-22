import React from "react";

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h3 className="mb-3 text-lg font-semibold text-white">Confirm Action</h3>
        <p className="mb-6 text-sm text-slate-300">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg border border-red-500/70 bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/30"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
