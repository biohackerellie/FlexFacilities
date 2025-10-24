import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Update } from './actions';

interface UserName {
  id: string;
  name: string;
  email: string;
}

export default function AccountForm({ data }: { data: UserName }) {
  const updateUserID = Update.bind(null, data.id);
  return (
    <form action={updateUserID} className='space-y-8'>
      <label className='block text-lg font-bold'>Name: {data.name} </label>
      <Input
        name='name'
        id='name'
        placeholder={data.name}
        defaultValue={data.name}
      />
      <Button className='float-right' />
    </form>
  );
}
