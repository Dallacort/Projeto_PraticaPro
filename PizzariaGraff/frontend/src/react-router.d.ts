import 'react-router-dom';

declare module 'react-router-dom' {
  export interface Params {
    [key: string]: string;
  }
  
  export function useParams<P extends Params = {}>(): P;
} 