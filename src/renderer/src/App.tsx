import { useEffect, useState } from 'react'

const App = () => {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [columns, setColumns] = useState([])
  const [filters, setFilters] = useState({})
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])

  // SQLite tablolarını yükleme
  useEffect(() => {
    window.api.getTables().then(setTables)
  }, [])

  // Tablo seçildiğinde kolonları getir
  const handleTableSelect = (table) => {
    setSelectedTable(table)
    setResults([])
    window.api.getColumns(table).then(setColumns)
  }

  // Input değişikliklerini takip et
  const handleInputChange = (column, value) => {
    setFilters((prev) => {
      if (value === '') {
        // Boş string ise column'u objeden kaldır
        const updatedFilters = { ...prev }
        delete updatedFilters[column]
        return updatedFilters
      }
      // Aksi halde column'u güncelle veya ekle
      return { ...prev, [column]: value }
    })
  }

  // Arama işlemi
  const handleSearch = () => {
    console.log(filters)
    setIsSearching(true)
    window.api.queryTable({ tableName: selectedTable, conditions: filters }).then((result) => {
      console.log(result)
      setIsSearching(false)
      setResults(result)
    })
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Burtigo v1.0</h3>
        <div className="tables">
          {tables.map((table) => (
            <button
              disabled={selectedTable == table}
              key={table}
              onClick={() => handleTableSelect(table)}
            >
              {table}
            </button>
          ))}
        </div>
        {/* <hr /> */}
        {selectedTable && (
          <>
            {/* <h3>{selectedTable}</h3> */}
            {/* Arama alanları */}
            <div className="filters">
              {columns.map((column) => (
                <div key={column} className="filter">
                  <label>{column}</label>
                  <input
                    type="text"
                    onChange={(e) => handleInputChange(column, e.target.value.toUpperCase())}
                  />
                </div>
              ))}
              <button onClick={handleSearch}>Search</button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="main">
        {isSearching && <h1>Searching...</h1>}
        {!isSearching && results && (
          <>
            {/* Sonuçlar */}
            <div className="results">
              {results.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      {Object.keys(results[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
