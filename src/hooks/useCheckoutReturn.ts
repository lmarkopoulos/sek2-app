import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

export function useCheckoutReturn(setTab: (tab: string) => void) {
  useEffect(() => {
    const sub = App.addListener('appUrlOpen', async (data: any) => {
      console.log('App opened with URL:', data.url);

      if (!data.url) return;

      // Ensure we only handle our scheme
      if (data.url.startsWith('sek2app://return')) {
        // Always close the in-app browser
        await Browser.close();

        const url = new URL(data.url);

        const status = url.searchParams.get('status');
        const orderId = url.searchParams.get('order_id');
        const pid = url.searchParams.get('pid');

        if (status === 'success') {
          console.log('✅ Checkout/Cart success detected', { orderId, pid });
          setTab('account'); // redirect to account or payment history
          alert('Η πληρωμή ολοκληρώθηκε με επιτυχία!');
        } else if (status === 'failed') {
          console.log('❌ Checkout/Cart failed/cancelled detected', { orderId, pid });
          setTab('payment'); // go back to payment tab
          alert('Η πληρωμή απέτυχε ή ακυρώθηκε.');
        }
      }
    });

    return () => {
      sub.remove();
    };
  }, [setTab]);
}
