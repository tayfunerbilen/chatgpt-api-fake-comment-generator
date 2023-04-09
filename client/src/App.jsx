import {useState} from "react";

function App() {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [comments, setComments] = useState([])
  const [formData, setFormData] = useState({
    productName: '',
    commentType: '',
    commentCount: ''
  })

  const changeHandle = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const submitHandle = e => {
    e.preventDefault()
    setLoading(true)
    fetch('http://localhost:3000/create-fake-comments', {
      method: 'post',
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(res => {
        if (res?.error) {
          setError(true)
          setComments([])
        } else {
          setComments(res)
          setError(false)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const isDisabled = Object.values(formData).some(value => !value) || loading

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
          <option value="Olumlu">Olumlu</option>
          <option value="Olumsuz">Olumsuz</option>
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

      {comments.length > 0 && (
        <div className="grid gap-y-4">
          {comments.map(({comment, author}, key) => (
            <section className="p-4 rounded border border-zinc-300">
              <header className="text-sm font-semibold mb-4">
                <h6 className="bg-blue-500 text-white py-1.5 px-3 inline rounded-md">
                  {author}
                </h6>
              </header>
              <p className="text-sm">
                {comment}
              </p>
            </section>
          ))}
        </div>
      )}

    </div>
  )
}

export default App
