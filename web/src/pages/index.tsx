import Head from "next/head";
import {Inter} from "next/font/google";
import Table from "react-bootstrap/Table";
import {Alert, Container, Pagination} from "react-bootstrap";
import {GetServerSideProps, GetServerSidePropsContext} from "next";
import { useEffect, useState } from "react";

const inter = Inter({subsets: ["latin"]});

type TUserItem = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  updatedAt: string
}

type TGetServerSideProps = {
  statusCode: number
  users: TUserItem[]
}


export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  try {
    const res = await fetch("http://localhost:3000/users", {method: 'GET'})
    if (!res.ok) {
      return {props: {statusCode: res.status, users: []}}
    }

    return {
      props: {statusCode: 200, users: await res.json()}
    }
  } catch (e) {
    return {props: {statusCode: 500, users: []}}
  }
}) satisfies GetServerSideProps<TGetServerSideProps>


export default function Home({statusCode, users}: TGetServerSideProps) {

  let limit: number = 20;
  const pageCount: number = Math.ceil(users.length / limit)

  const [rows, SetRows] = useState([]);
  const [currentPage, SetCurrentPage] = useState(0);

  const showPageItemsFunction = () => {
  const pagintionData = [];

  const start = Math.min(Math.max(1, currentPage - 4), pageCount - 9)  || 1;
  const end = Math.min(pageCount, start + 9);

    pagintionData.push(
      <Pagination.First
          key="first"
          onClick={() => handlePageClick(0)}
      />
    );

    pagintionData.push(
      <Pagination.Prev
          key="prev"
          onClick={() => handlePageClick(currentPage - 1)}
      />
    );
    
    for (let i = start; i <= end; i++) {
      pagintionData.push(
            <Pagination.Item
            key={i}
            active={currentPage  == i-1}
            onClick={() => handlePageClick(i - 1)}
        >
            {i}
            </Pagination.Item>
        );
    }

    pagintionData.push(
      <Pagination.Next
          key="next"
          onClick={() => handlePageClick(currentPage + 1)}
      />
    );

    pagintionData.push(
      <Pagination.Last
          key="last"
          onClick={() => handlePageClick(pageCount - 1)}
      />
    );

    return pagintionData;
  };

  const handlePageClick = (selected: number) => {
    if (selected >= 0 && selected < pageCount)
        SetCurrentPage(selected);
  };

  const displayRows = () => {
    const start = currentPage * limit;
    const end = start + limit;
    rows.forEach((row: any, index: number) => {
      if (index < start || index >= end) {
        row.style.display = "none";
      } else {
        row.style.display = "";
      }
    });
  };

  useEffect(() => {
    let tbody: any = document.querySelector("tbody");
    let loaded_rows: any = tbody.querySelectorAll("tr");
    SetRows(loaded_rows);
  }, [])

  displayRows();

  if (statusCode !== 200) {
    return <Alert variant={'danger'}>Ошибка {statusCode} при загрузке данных</Alert>
  }

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={'mb-5'}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Дата обновления</th>
            </tr>
            </thead>
            <tbody>
            {
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))
            }
            </tbody>
          </Table>

          <Pagination key="pagination">
            {showPageItemsFunction()}
            </Pagination>

        </Container>
      </main>
    </>
  );
}
