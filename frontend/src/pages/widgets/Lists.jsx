export default function WidgetsLists() {
  return (
    <div className="main-content">
      <h4 className="mb-4">Widgets - Listes</h4>
      <div className="row">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h6 className="card-title mb-0">Liste Simple</h6></div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {['Item 1', 'Item 2', 'Item 3'].map((item, i) => (
                  <li key={i} className="list-group-item">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
