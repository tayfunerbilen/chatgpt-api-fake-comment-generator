import {useEffect, useState} from "react";

function App() {

  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState(false)
  const [comments, setComments] = useState([])
  const [formData, setFormData] = useState({
    productName: '',
    commentType: '',
    commentCount: '',
    language: ''
  })

  const changeHandle = e => {
    console.log(e.target.value)
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const submitHandle = e => {
    e.preventDefault()
    setLoading(true)
    setAnswer('')
    setError(false)
    fetch('http://localhost:3000/create-fake-comments', {
      method: 'post',
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(formData)
    })
      .then(
        async res => {
          if (res.status === 200) {
            const data = res.body;
            if (!data) {
                return;
            }
    
            const reader = data.getReader();
            const decoder = new TextDecoder();
            let done = false;
    
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);
                setAnswer((prev) => prev + chunkValue);
            }
          } else {
            return { error: true }
          }
        }
      )
      .then(res => {
        if (res?.error) {
          setError(true)
          setComments([])
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const isDisabled = Object.values(formData).some(value => !value) || loading

  useEffect(() => {
    if (answer === 'NO_COMMENT') {
      setComments([])
      setError(true)

      return;
    }

    if (answer) {
      const comments = answer.split('---').map(comment => {
        const matches = comment.match(/author: (.+)\ncomment: (.+)/s);

        if (!matches){
          return {author: '', commentText: ''}
        }

        const author = matches[1];
        const commentText = matches[2];
        return { author, commentText };
      });

        setComments(comments)
    }
  }, [answer])

  return (
    <div className="max-w-[1000px] mx-auto py-10">

      <h1 className="text-xl font-bold mb-4">Ürünlerle ilgili Fake Yorum Üretici</h1>

      <form onSubmit={submitHandle} className="w-full mb-5 flex items-center gap-x-4">
        <input
          type="text"
          onChange={changeHandle}
          value={formData.productName}
          name="productName"
          placeholder="Ürün adı"
          className="h-10 rounded border border-zinc-300 outline-none px-4 text-sm flex-auto"
        />
        <select
          onChange={changeHandle}
          name="commentType"
          value={formData.commentType}
          className="appearance-none h-10 rounded border border-zinc-300 outline-none px-4 text-sm flex-auto"
        >
          <option value="">Yorum Tipi</option>
          <option value="Positive">Olumlu</option>
          <option value="Negative">Olumsuz</option>
        </select>
        <select
          onChange={changeHandle}
          name="language"
          value={formData.language}
          className="appearance-none h-10 rounded border border-zinc-300 outline-none px-4 text-sm flex-auto"
        >
          <option value="" disabled selected>Dil</option>
          <option value="English">İngilizce</option>
          <option value="French">Fransızca</option>
          <option value="German">Almanca</option>
          <option value="Italian">İtalyanca</option>
          <option value="Spanish">İspanyolca</option>
          <option value="Turkish">Türkçe</option>
        </select>
        <input
          onChange={changeHandle}
          type="text"
          value={formData.commentCount}
          name="commentCount"
          placeholder="Kaç adet yorum üretilsin?"
          className="h-10 rounded border border-zinc-300 outline-none px-4 text-sm flex-auto"
        />
        <button
          disabled={isDisabled}
          className="h-10 px-10 rounded bg-blue-500 text-white text-sm disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? '...' : 'Üret'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          Geçersiz bir ürün girdiniz, lütfen doğru bir ürün adı ve sayısı ile tekrar deneyin!
        </div>
      )}

      {(comments.length > 0 && !error) && (
        <div className="grid gap-y-4">
          {comments.map(({commentText, author}, key) => (
            commentText !== '' && 
            (<section className="p-4 rounded border border-zinc-300">
              <header className="text-sm font-semibold mb-4">
                <h6 className="bg-blue-500 text-white py-1.5 px-3 inline rounded-md">
                  {author}
                </h6>
              </header>
              <p className="text-sm">
                {commentText}
              </p>
            </section>)
          ))}
        </div>
      )}

    </div>
  )
}

export default App
