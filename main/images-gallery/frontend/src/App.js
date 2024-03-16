import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Search from './components/Search';
import ImageCard from './components/ImageCard';
import Welcome from './components/Welcome';
import { Container, Row, Col } from 'react-bootstrap';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

const App = () => {
  const [word, setWord] = useState('');
  const [images, setImages] = useState(() => {
    const result = [];
    fetch(`${API_URL}/images`)
      .then((res) => res.json())
      .then((data) => {
        for (var i = 0; i < data.length; i++) {
          result.push(data[i]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return result;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/random-image?query=${word}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          console.log(
            `${API_URL}/random-image?query=${word}`,
            ' => ',
            data.errors
          );
          return;
        }
        var json = { ...data, title: word };
        setImages([json, ...images]);
        setTimeout(() => {
          fetch(`${API_URL}/images`, {
            method: 'POST',
            body: JSON.stringify(json),
            headers: {
              'Content-Type': 'application/json',
            },
          }).catch((err) => {
            console.log(err);
          });
        }, 0);
      })
      .catch((err) => {
        console.log(err);
      });
    setWord('');
  };

  const handleDeleteImage = (id) => {
    setImages(images.filter((image) => image.id !== id));
    setTimeout(() => {
      fetch(`${API_URL}/images/${id}`, {
        method: 'DELETE',
      }).catch((err) => {
        console.log(err);
      });
    }, 0);
  };

  return (
    <div>
      <Header title="Images Gallery" />
      <Search word={word} setWord={setWord} handleSubmit={handleSearchSubmit} />
      <Container className="mt-4">
        {images.length ? (
          <Row xs={1} md={2} lg={3}>
            {images.map((image, i) => (
              <Col key={i} className="pb-3">
                <ImageCard image={image} deleteImage={handleDeleteImage} />
              </Col>
            ))}
          </Row>
        ) : (
          <Welcome />
        )}
      </Container>
    </div>
  );
};

export default App;
