import { QueryClient, QueryClientProvider } from "react-query";
import './App.css';
import DisplayTokenComponent from './DisplayToken';
const queryClient = new QueryClient();
function App() {

  return (
      <div className="App">
        <QueryClientProvider client={queryClient}>
          <DisplayTokenComponent />
        </QueryClientProvider>
      </div>
  );
}

export default App;
