import { useState } from 'react'

const App = () => {
  const [methods, setMethods] = useState([
    {
      name: 'Sqlite',
      methodInputs: [
        {
          type: 'file',
          name: 'dbPath',
          title: 'Database Path',
          value: ''
        }
      ]
    },
    {
      name: 'MySQL',
      methodInputs: [
        {
          type: 'text',
          name: 'host',
          title: 'Host',
          value: ''
        },
        {
          type: 'text',
          name: 'port',
          title: 'Port',
          value: ''
        },
        {
          type: 'text',
          name: 'user',
          title: 'User',
          value: ''
        },
        {
          type: 'password',
          name: 'password',
          title: 'Password',
          value: ''
        },
        {
          type: 'text',
          name: 'database',
          title: 'Database Name',
          value: ''
        }
      ]
    },
    {
      name: 'MongoDB',
      methodInputs: [
        {
          type: 'text',
          name: 'uri',
          title: 'Connection URI',
          value: ''
        },
        {
          type: 'text',
          name: 'dbName',
          title: 'Database Name',
          value: ''
        }
      ]
    }
  ])

  const [selectedDbFile, setSelectedDbFile] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<any>()
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState()
  const [columns, setColumns] = useState([])
  const [isExactMatch, setIsExactMatch] = useState(false)
  const [filters, setFilters] = useState({})
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])

  const handleTableSelect = (table) => {
    setSelectedTable(table)
    setFilters({})
    setResults([])
    window.db.getColumns(table).then(setColumns)
  }

  const handleInputChange = (column, value) => {
    setFilters((prev) => {
      if (value === '') {
        const updatedFilters = { ...prev }
        delete updatedFilters[column]
        return updatedFilters
      }
      return { ...prev, [column]: value }
    })
  }

  const handleSearch = () => {
    setIsSearching(true)
    window.db.query(selectedTable, filters, isExactMatch).then((result) => {
      setIsSearching(false)
      setResults(result)
    })
  }

  const handleQuit = () => {
    window.db.quitDatabase()
    setSelectedDbFile('')
    setSelectedMethod(null)
    setSelectedTable(undefined)
    setTables([])
    setColumns([])
    setFilters({})
    setIsExactMatch(false)
    setIsSearching(false)
    setResults([])
    setIsConnected(false)
  }

  const handleMethodInputChange = (column, value) => {
    setSelectedMethod((prev) => {
      const updatedMethodInputs = prev.methodInputs.map((item) => {
        if (item.name != column) return item
        return { ...item, value }
      })
      return { ...prev, methodInputs: updatedMethodInputs }
    })
  }

  const handleConnectDb = () => {
    const complated = selectedMethod.methodInputs.every((input) => input.value.trim() !== '')
    if (complated) {
      window.db.connectToDatabase(selectedMethod).then(() =>
        window.db.getTables().then((tables) => {
          setTables(tables)
          setSelectedTable(tables[0])
          window.db.getColumns(tables[0]).then(setColumns)
          setIsConnected(true)
        })
      )
    }
  }

  const handleCancel = () => {
    setSelectedMethod(null)
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h3>Burtico v1.3</h3>
        {selectedMethod && !isConnected && (
          <div className="method-inputs">
            <h3>{selectedMethod.name}</h3>
            {selectedMethod.methodInputs.map((methodInput) => (
              <div key={methodInput.title}>
                {methodInput.type === 'file' ? (
                  <>
                    <div
                      className="custom-drag-drop"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const file = e.dataTransfer.files[0]
                        setSelectedDbFile(file.name)
                        if (file) {
                          handleMethodInputChange(methodInput.name, file.path)
                        }
                      }}
                    >
                      Drop db file here or choose path bellow.
                    </div>
                    <label htmlFor={`${methodInput.name}-upload`} className="custom-file-upload">
                      Choose db path
                    </label>
                    <input
                      id={`${methodInput.name}-upload`}
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        setSelectedDbFile(file.name)
                        if (file) {
                          handleMethodInputChange(methodInput.name, file.path)
                        }
                      }}
                    />
                    {selectedDbFile && <p>selected: {selectedDbFile}</p>}
                  </>
                ) : (
                  <div>
                    <label>{methodInput.title}</label>
                    <input
                      type={methodInput.type}
                      onChange={(e) => {
                        handleMethodInputChange(methodInput.name, e.target.value)
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
            <button onClick={handleConnectDb}>Connect</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        )}
        {!selectedMethod && (
          <div className="methods">
            <h3>Choose method</h3>
            {methods.map((method) => (
              <button
                key={method.name}
                onClick={() =>
                  setSelectedMethod(
                    methods.find((i) => {
                      return i.name == method.name
                    })
                  )
                }
              >
                {method.name}
              </button>
            ))}
          </div>
        )}
        {isConnected && (
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
        )}
        {selectedTable && (
          <>
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
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="checkbox"
                  checked={isExactMatch}
                  onChange={() => {
                    setIsExactMatch(!isExactMatch)
                  }}
                />{' '}
                Exact match
              </label>
              <button onClick={handleSearch}>Search</button>
              <button onClick={handleQuit}>Quit</button>
            </div>
          </>
        )}
      </div>
      <div className="main">
        {isSearching && <h1>Searching...</h1>}
        {!isSearching && results && (
          <>
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
                          <td key={i}>
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </td>
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
