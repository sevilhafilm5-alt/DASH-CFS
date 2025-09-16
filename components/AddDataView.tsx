import React, { useState, useCallback } from 'react';
import { DashboardData, Transaction, DailyData } from '../types';

interface AddDataViewProps {
  onUpdateData: (newData: Partial<DashboardData>) => void;
  onResetData: () => void;
}

const Card: React.FC<{ title: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, children, footer }) => (
    <div className="bg-base-100 rounded-xl shadow-sm">
        <div className="p-6 border-b border-base-300">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        {footer && <div className="p-6 bg-base-200/50 rounded-b-xl border-t border-base-300">{footer}</div>}
    </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
        <input {...props} className="w-full px-3 py-2 bg-white border border-base-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition disabled:bg-base-200/50" />
    </div>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
        <textarea {...props} rows={3} className="w-full px-3 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition" />
    </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, variant = 'primary', ...props }) => {
    const baseClasses = "px-4 py-2 font-semibold rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
        primary: "bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary",
        secondary: "bg-base-200 text-text-primary hover:bg-base-300 focus:ring-base-300",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    };
    return (
        <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
            {children}
        </button>
    );
};

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
    <button type="button" className={`${enabled ? 'bg-brand-primary' : 'bg-base-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`} role="switch" aria-checked={enabled} onClick={() => onChange(!enabled)}>
      <span aria-hidden="true" className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
);

const getRandomTimeForDate = (dateString: string): Date => {
    const date = new Date(dateString);
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);
    // Use setUTCHours to avoid local timezone from shifting the date
    date.setUTCHours(randomHour, randomMinute, randomSecond, 0);
    return date;
};

export const AddDataView: React.FC<AddDataViewProps> = ({ onUpdateData, onResetData }) => {
  // Single sale state
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<Transaction['status']>('Aprovado');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Bulk sale state
  const [bulkProduct, setBulkProduct] = useState('');
  const [bulkAmount, setBulkAmount] = useState('');
  const [bulkQuantity, setBulkQuantity] = useState('1');
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRandomizationEnabled, setIsRandomizationEnabled] = useState(false);
  const [conversionRate, setConversionRate] = useState('90');

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationImage, setNotificationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNotificationImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setNotificationImage(null);
      setImagePreview(null);
    }
  };

  const handleAddTransaction = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!product.trim() || isNaN(numericAmount) || numericAmount <= 0 || !date) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const transactionDate = getRandomTimeForDate(date);
    const newTransaction: Transaction = {
      id: `tr_${Date.now()}`,
      product,
      amount: numericAmount,
      status,
      date: transactionDate.toISOString(),
    };
    
    const newDailyDataItem: DailyData = {
        date: transactionDate.toISOString().split('T')[0],
        sales: status === 'Aprovado' ? numericAmount : 0,
        transactions: status === 'Aprovado' ? 1 : 0,
    };
    
    onUpdateData({ transactions: [newTransaction], dailyData: [newDailyDataItem] });

    setProduct('');
    setAmount('');
    setStatus('Aprovado');
    alert('Transação adicionada com sucesso!');
  }, [product, amount, status, date, onUpdateData]);

  const handleAddBulkTransactions = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(bulkAmount);
    const numericQuantity = parseInt(bulkQuantity, 10);
    const numericConversionRate = parseFloat(conversionRate);

    let baseValidation = !bulkProduct.trim() || isNaN(numericAmount) || numericAmount <= 0 || isNaN(numericQuantity) || numericQuantity <= 0 || !bulkDate;
    let conversionValidation = isRandomizationEnabled && (isNaN(numericConversionRate) || numericConversionRate < 0 || numericConversionRate > 100);

    if (baseValidation || conversionValidation) {
        alert('Por favor, preencha todos os campos do lote corretamente.');
        return;
    }

    const dateString = new Date(`${bulkDate}T00:00:00Z`).toISOString().split('T')[0];
    const newTransactions: Transaction[] = [];
    let totalSales = 0;
    let approvedCount = 0;

    for (let i = 0; i < numericQuantity; i++) {
        let currentStatus: Transaction['status'] = 'Aprovado';
        if (isRandomizationEnabled) {
            if (Math.random() * 100 > numericConversionRate) {
                currentStatus = 'Pendente';
            }
        }
        
        const transactionDate = getRandomTimeForDate(bulkDate);
        const newTransaction: Transaction = {
            id: `tr_${Date.now()}_${i}`,
            product: bulkProduct,
            amount: numericAmount,
            status: currentStatus,
            date: transactionDate.toISOString(),
        };
        newTransactions.push(newTransaction);
        
        if (currentStatus === 'Aprovado') {
            totalSales += numericAmount;
            approvedCount++;
        }
    }

    const newDailyDataItem: DailyData = { date: dateString, sales: totalSales, transactions: approvedCount };
    onUpdateData({ transactions: newTransactions, dailyData: [newDailyDataItem] });

    setBulkProduct('');
    setBulkAmount('');
    setBulkQuantity('1');
    alert(`${numericQuantity} transações adicionadas com sucesso!`);
  }, [bulkProduct, bulkAmount, bulkQuantity, bulkDate, isRandomizationEnabled, conversionRate, onUpdateData]);

  const createNotification = () => {
    if (!notificationMessage.trim()) {
      alert("Por favor, escreva uma mensagem para a notificação.");
      return;
    }
    const iconUrl = notificationImage ? URL.createObjectURL(notificationImage) : undefined;
    const notification = new Notification('Cosméticos Full Service', { body: notificationMessage, icon: iconUrl, tag: 'cosmeticos-full-service-notification' });
    if(iconUrl) notification.onclose = () => URL.revokeObjectURL(iconUrl);
    alert('Notificação disparada!');
  };

  const handleSendNotifications = () => {
    if (!notificationsEnabled) {
      alert("As notificações estão desativadas.");
      return;
    }
    
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
        alert('As notificações web nativas não são totalmente suportadas em aplicativos da tela inicial (PWAs) no iOS. Para uma experiência de notificação completa, use um navegador de desktop ou um dispositivo Android.');
        return;
    }

    if (!('Notification' in window)) {
      alert('Este navegador não suporta notificações.');
      return;
    }

    if (Notification.permission === 'granted') {
      createNotification();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') createNotification();
        else alert('Permissão para notificações foi negada.');
      });
    } else {
      alert('As notificações estão bloqueadas. Por favor, habilite-as nas configurações do seu navegador.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-text-primary">Gerenciar Vendas</h2>
      
      <form onSubmit={handleAddTransaction}>
        <Card title="Adicionar Venda Única" footer={<div className="flex justify-end"><Button type="submit">Adicionar Venda</Button></div>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome do Produto" value={product} onChange={e => setProduct(e.target.value)} placeholder="Ex: Sérum Vitamina C" required />
            <Input label="Valor (R$)" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Ex: 199.90" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as Transaction['status'])} className="w-full px-3 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition bg-white">
                <option value="Aprovado">Aprovado</option>
                <option value="Pendente">Pendente</option>
                <option value="Recusado">Recusado</option>
              </select>
            </div>
            <Input label="Data da Venda" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
        </Card>
      </form>

      <form onSubmit={handleAddBulkTransactions}>
        <Card title="Adicionar Vendas em Lote" footer={<div className="flex justify-end"><Button type="submit">Adicionar em Lote</Button></div>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome do Produto" value={bulkProduct} onChange={e => setBulkProduct(e.target.value)} placeholder="Ex: Protetor Solar FPS 50" required />
            <Input label="Data das Vendas" type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Valor por Unidade (R$)" type="number" step="0.01" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} placeholder="Ex: 89.90" required />
            <Input label="Quantidade" type="number" min="1" value={bulkQuantity} onChange={e => setBulkQuantity(e.target.value)} placeholder="Ex: 10" required />
          </div>
          <div className="border-t border-base-300 mt-4 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">Ativar Randomização de Status</span>
                  <ToggleSwitch enabled={isRandomizationEnabled} onChange={setIsRandomizationEnabled} />
              </div>
              <div className={`transition-opacity duration-300 ${isRandomizationEnabled ? 'opacity-100' : 'opacity-50'}`}>
                  <Input 
                      label="Taxa de Conversão Aprovada (%)" 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="1"
                      value={conversionRate} 
                      onChange={e => setConversionRate(e.target.value)} 
                      placeholder="Ex: 90" 
                      disabled={!isRandomizationEnabled}
                      required={isRandomizationEnabled}
                  />
              </div>
          </div>
        </Card>
      </form>
      
      <Card title="Configurar Notificações" footer={<div className="flex justify-end"><Button onClick={handleSendNotifications} disabled={!notificationsEnabled}>Disparar Notificação</Button></div>}>
        <div className="flex items-center justify-between">
          <span className="font-medium text-text-primary">Ativar Notificações</span>
          <ToggleSwitch enabled={notificationsEnabled} onChange={setNotificationsEnabled} />
        </div>
        <div className={`space-y-4 transition-opacity duration-300 ${notificationsEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <Textarea label="Mensagem da Notificação" value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} placeholder="Ex: Nova promoção de verão! Descontos de até 50%!" disabled={!notificationsEnabled} />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Imagem da Notificação (Opcional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-base-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto object-contain rounded"/> : <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-brand-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary"><span className="px-1">Carregar um arquivo</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" disabled={!notificationsEnabled} /></label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Gerenciamento de Dados">
        <p className="text-text-secondary">Isso limpará todas as transações e dados de vendas do dashboard. Esta ação não pode ser desfeita.</p>
        <div className="flex justify-end mt-4">
          <Button variant="danger" onClick={() => { if (window.confirm('Tem certeza que deseja resetar todos os dados?')) { onResetData(); }}}>Resetar Dados</Button>
        </div>
      </Card>
    </div>
  );
};